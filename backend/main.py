"""
Survey Paper Classifier API
===================
Classifies uploaded publication lists into survey / magazine-overview /
non-paper / research, and recalculates h-index, i10-index and citations
without the excluded surveys (non-papers count in both).

The classification pipeline in ./pipeline is a copy of the model repository's
code (see pipeline/README.md); the model is loaded once at startup.
"""

import io
import json
import os
import sys
import threading
import time
import traceback
from contextlib import asynccontextmanager
from typing import Optional

import pandas as pd
import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BACKEND_DIR, "pipeline"))

from classifier import MODES, calculate_indices, categorize, classify_frame, prepare_frame  # noqa: E402
from hybrid import LearnedHybrid  # noqa: E402
from inference import load_config, load_model, predict_survey_proba  # noqa: E402
from text_utils import paper_text  # noqa: E402

MODEL_PATH = os.environ.get("SURVEY_MODEL_PATH", os.path.join(BACKEND_DIR, "distilbert_survey_model"))
PIPELINE_COMMIT = "970c779"
MAX_UPLOAD_MB = 50
REQUIRED_MODEL_FILES = ("config.json", "model.safetensors", "tokenizer.json",
                        "survey_config.json", "hybrid_combiner.joblib")

# Accepted spellings of each input column (compared lower-cased and stripped)
COLUMN_ALIASES = {
    "title": {"title"},
    "abstract": {"abstract"},
    "citationCount": {"n_citation", "n_citations", "citations", "citation_count", "citation count", "citationcount",
                      "num_citations", "num citations", "cited by", "citedby", "citation", "cited_by_count"},
    "venue": {"venue", "journal", "source"},
    "type": {"type", "publicationtypes", "publication_types", "publication type"},
    "ReferenceCount": {"referencecount", "reference_count", "references_count", "referenced_works_count"},
    "references": {"references"},
}

STATE: dict = {}
INFERENCE_LOCK = threading.Lock()


def load_pipeline() -> None:
    missing = [f for f in REQUIRED_MODEL_FILES if not os.path.exists(os.path.join(MODEL_PATH, f))]
    if missing:
        raise RuntimeError(f"Model folder '{MODEL_PATH}' is missing {missing}. "
                           "Copy the trained model from the model repository (see README).")
    tokenizer, model = load_model(MODEL_PATH)
    combiner = LearnedHybrid.load(MODEL_PATH)
    config = load_config(MODEL_PATH)
    STATE.update(tokenizer=tokenizer, model=model, combiner=combiner, config=config,
                 device=str(next(model.parameters()).device))
    print(f"Model loaded from '{MODEL_PATH}' on {STATE['device']}")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    load_pipeline()  # fail fast: no silent keyword-only fallback
    yield


app = FastAPI(title="Survey Paper Classifier API", version="2.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://{host}:{port}" for host in ("localhost", "127.0.0.1")
                   for port in (8080, 8081, 5173, 3000)],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Input handling ---------------- #
def read_csv(content: bytes) -> pd.DataFrame:
    for encoding in ("utf-8-sig", "latin-1"):
        try:
            return pd.read_csv(io.BytesIO(content), encoding=encoding)
        except UnicodeDecodeError:
            continue
        except pd.errors.EmptyDataError:
            raise HTTPException(status_code=400, detail="The CSV file is empty.")
    raise HTTPException(status_code=400, detail="Could not decode the CSV file (use UTF-8).")


def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    lookup = {col.strip().lower(): col for col in df.columns}
    renames = {}
    for target, aliases in COLUMN_ALIASES.items():
        source = next((lookup[a] for a in aliases if a in lookup), None)
        if source is not None:
            renames[source] = target

    missing = [c for c in ("title", "citationCount") if c not in renames.values()]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=(f"CSV must contain a title column and a citation count column "
                    f"(e.g. 'n_citation', 'citations' or 'citationCount'). Found: {list(df.columns)}"))

    df = df.rename(columns=renames)
    if "abstract" not in df.columns:
        df["abstract"] = ""
    df["title"] = df["title"].fillna("").astype(str)
    df["abstract"] = df["abstract"].fillna("").astype(str)
    df["citationCount"] = pd.to_numeric(df["citationCount"], errors="coerce").fillna(0).astype(int)
    return df[df["title"].str.strip() != ""].reset_index(drop=True)


def records(df: pd.DataFrame) -> list:
    """JSON-safe records (NaN -> null, numpy types -> Python)."""
    return json.loads(df.to_json(orient="records"))


# ---------------- Endpoints ---------------- #
@app.get("/")
def root():
    return {"message": "Survey Paper Classification API is running"}


@app.get("/health")
def health():
    return {
        "status": "healthy" if STATE else "model not loaded",
        "modelLoaded": bool(STATE),
        "modelPath": MODEL_PATH,
        "device": STATE.get("device"),
        "distilbertThreshold": STATE.get("config", {}).get("threshold"),
        "hybridThreshold": getattr(STATE.get("combiner"), "threshold", None),
        "pipelineCommit": PIPELINE_COMMIT,
    }


@app.post("/classify")
def classify(
    file: UploadFile = File(...),
    mode: str = Form("learned"),
    exclude_magazine_overviews: bool = Form(False),
):
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    if mode not in MODES:
        raise HTTPException(status_code=400, detail=f"mode must be one of {list(MODES)}")

    content = file.file.read(MAX_UPLOAD_MB * 1024 * 1024 + 1)
    if len(content) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File is larger than {MAX_UPLOAD_MB} MB")

    df = standardize_columns(read_csv(content))
    if df.empty:
        raise HTTPException(status_code=400, detail="The CSV file has no papers with a title.")

    try:
        start = time.time()
        frame = prepare_frame(df)
        survey_proba: Optional[object] = None
        if mode != "keyword":
            texts = [paper_text(t, a) for t, a in zip(frame["Title"], frame["Abstract"])]
            with INFERENCE_LOCK:
                survey_proba = predict_survey_proba(texts, STATE["tokenizer"], STATE["model"],
                                                    max_length=STATE["config"].get("max_length", 384))
        is_survey, score = classify_frame(frame, model_path=MODEL_PATH, mode=mode, survey_proba=survey_proba)
        df["Category"] = categorize(frame, is_survey)
        df["SurveyScore"] = [round(float(s), 4) for s in score]
        processing_time = time.time() - start
    except Exception as e:  # report failures instead of silently falling back
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Classification failed: {e}")

    # Only surveys are removed from the metrics; non-papers stay in both (as in the paper)
    excluded_categories = {"survey"} | ({"magazine-overview"} if exclude_magazine_overviews else set())
    excluded = df["Category"].isin(excluded_categories)
    df["Prediction"] = (~excluded).astype(int)  # 0 = survey (excluded), 1 = kept
    kept_df, excluded_df = df[~excluded], df[excluded]

    counts = df["Category"].value_counts()
    total_papers, total_citations = len(df), int(df["citationCount"].sum())
    excluded_citations = int(excluded_df["citationCount"].sum())
    h_before, i10_before = calculate_indices(df)
    h_after, i10_after = calculate_indices(kept_df)

    return {
        "fileName": file.filename,
        "fileSize": f"{len(content) / 1024:.2f}",
        "processingTime": f"{processing_time:.2f}s",
        "mode": mode,
        "excludeMagazineOverviews": exclude_magazine_overviews,
        "categories": {
            "survey": int(counts.get("survey", 0)),
            "magazineOverview": int(counts.get("magazine-overview", 0)),
            "nonPaper": int(counts.get("non-paper", 0)),
            "research": int(counts.get("research", 0)),
        },
        "totalPapers": total_papers,
        "surveyPapers": int(counts.get("survey", 0)),
        "excludedPapers": int(excluded.sum()),
        "nonSurveyPapers": len(kept_df),
        "totalCitations": total_citations,
        "excludedCitations": excluded_citations,
        "remainingCitations": total_citations - excluded_citations,
        "hIndexBefore": h_before,
        "hIndexAfter": h_after,
        "i10Before": i10_before,
        "i10After": i10_after,
        "percentPapersExcluded": f"{100 * excluded.sum() / total_papers:.2f}",
        "percentCitationsExcluded": f"{100 * excluded_citations / total_citations:.2f}" if total_citations else "0.00",
        "comparison": [
            ["Total Papers", total_papers, len(kept_df)],
            ["Total Citations", total_citations, total_citations - excluded_citations],
            ["H-Index", h_before, h_after],
            ["i10-Index", i10_before, i10_after],
        ],
        "allSurveyData": records(excluded_df),
        "allNonSurveyData": records(kept_df),
    }


if __name__ == "__main__":
    # 127.0.0.1: only reachable from this computer; set HOST=0.0.0.0 to expose it on the network
    uvicorn.run(app, host=os.environ.get("HOST", "127.0.0.1"), port=int(os.environ.get("PORT", 8000)))
