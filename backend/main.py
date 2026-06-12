import os
import time
import pandas as pd
import torch
import numpy as np
from typing import List, Tuple, Optional
from tabulate import tabulate
from torch.utils.data import Dataset, DataLoader
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from torch.amp import autocast
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import tempfile
import json

# Initialize FastAPI app
app = FastAPI(title="SurvayExtruderU API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080", "http://localhost:8081"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Survey Keyword Logic ---------------- #
survey_keywords = [
    "survey", "review", "overview", "comparative",
    "taxonomy", "state of the art", "systematic"
]

def keyword_is_survey(text: str) -> bool:
    text = text.lower()
    return any(keyword in text for keyword in survey_keywords)

# ---------------- Dataset Wrapper ---------------- #
class SurveyDataset(Dataset):
    def __init__(self, texts: List[str], tokenizer: DistilBertTokenizerFast, max_length: int = 512):
        self.encodings = tokenizer(texts, truncation=True, padding=True, max_length=max_length)

    def __len__(self) -> int:
        return len(self.encodings['input_ids'])

    def __getitem__(self, idx: int) -> dict:
        return {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}

# ---------------- Hybrid Classifier Function ---------------- #
def classify_with_hybrid_model(
    df: pd.DataFrame,
    model_path: str = './distilbert_survey_model',
    batch_size: int = 8,
    threshold: float = 0.8
) -> List[int]:

    tokenizer = DistilBertTokenizerFast.from_pretrained(model_path)
    
    # Load model with proper configuration to handle BFloat16 issues
    try:
        # Force model to use float32 and handle architecture mismatch
        model = DistilBertForSequenceClassification.from_pretrained(
            model_path, 
            ignore_mismatched_sizes=True,
            torch_dtype=torch.float32,
            force_download=False,
            local_files_only=True
        )
        
        # Convert model to float32 explicitly
        model = model.float()
        # Model loaded successfully with float32 precision
        
    except Exception as e:
        # Model loading error, falling back to keyword-only classification
        texts = (df['title'].astype(str) + " " + df['abstract'].astype(str)).str.lower().tolist()
        return [0 if keyword_is_survey(t) else 1 for t in texts]
    
    model.eval()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    texts = (df['title'].astype(str) + " " + df['abstract'].astype(str)).str.lower().tolist()
    dataset = SurveyDataset(texts, tokenizer)
    dataloader = DataLoader(dataset, batch_size=batch_size)

    all_probs = []

    with torch.no_grad():
        for batch in dataloader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)

            try:
                # Run inference without autocast to avoid BFloat16 issues
                outputs = model(input_ids=input_ids, attention_mask=attention_mask)
                logits = outputs.logits
                probs = torch.nn.functional.softmax(logits, dim=-1)
                survey_probs = probs[:, 0].cpu().numpy()  # class 0 = survey
                all_probs.extend(survey_probs)
                
            except Exception as e:
                # Inference error occurred
                # Fallback to keyword classification for this batch
                batch_texts = texts[len(all_probs):len(all_probs)+len(input_ids)]
                batch_keyword_preds = [0 if keyword_is_survey(t) else 1 for t in batch_texts]
                all_probs.extend([0.8 if pred == 0 else 0.2 for pred in batch_keyword_preds])

    model_preds = [0 if prob > threshold else 1 for prob in all_probs]
    keyword_preds = [0 if keyword_is_survey(t) else None for t in texts]

    final_preds = [
        kp if kp is not None else mp
        for kp, mp in zip(keyword_preds, model_preds)
    ]
    return final_preds

# ---------------- Index Calculation ---------------- #
def calculate_indices(df: pd.DataFrame) -> Tuple[int, int]:
    citations = df['n_citation'].fillna(0).astype(int).sort_values(ascending=False).values
    h_index = int(sum(c >= (i + 1) for i, c in enumerate(citations)))
    i10_index = int(sum(c >= 10 for c in citations))
    return h_index, i10_index

# ---------------- API Endpoints ---------------- #
@app.get("/")
async def root():
    return {"message": "Survey Paper Classification API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_available": os.path.exists("./distilbert_survey_model")}

@app.post("/classify")
async def classify_papers(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(mode='wb', suffix='.csv', delete=False) as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name
    
    try:
        # Load and validate CSV
        df = pd.read_csv(tmp_file_path)
        # Loaded CSV successfully

        required_cols = {'title', 'abstract', 'n_citation'}
        if not required_cols.issubset(df.columns):
            raise HTTPException(
                status_code=400, 
                detail=f"CSV must contain the columns: {required_cols}"
            )

        # Clean empty entries
        df = df.dropna(subset=['title', 'abstract', 'n_citation'])
        df = df[~df[['title', 'abstract']].apply(lambda x: x.str.strip().eq('').any(), axis=1)]
        # Cleaned dataset successfully

        # Check if model exists
        model_path = './distilbert_survey_model'
        if not os.path.exists(model_path):
            raise HTTPException(
                status_code=500, 
                detail="Model not found. Please ensure the model is available."
            )

        # Run classification
        start_time = time.time()
        df['Prediction'] = classify_with_hybrid_model(df, model_path)
        processing_time = time.time() - start_time

        # Separate survey and non-survey papers
        survey_df = df[df['Prediction'] == 0]
        non_survey_df = df[df['Prediction'] == 1].drop(columns=['Prediction'])

        # Calculate metrics
        total_papers = len(df)
        excluded_papers = len(survey_df)
        excluded_citations = int(survey_df['n_citation'].fillna(0).astype(int).sum())
        total_citations = int(df['n_citation'].fillna(0).astype(int).sum())

        percent_papers_excluded = (excluded_papers / total_papers) * 100 if total_papers else 0
        percent_citations_excluded = (excluded_citations / total_citations) * 100 if total_citations else 0

        total_h_index, total_i10 = calculate_indices(df)
        non_survey_h_index, non_survey_i10 = calculate_indices(non_survey_df)

        # Clean data for JSON serialization
        def clean_dataframe_for_json(df):
            """Clean DataFrame to ensure JSON serialization compatibility"""
            df_clean = df.copy()
            
            # Replace NaN, Infinity, and -Infinity with None or 0
            df_clean = df_clean.replace([float('inf'), float('-inf')], None)
            df_clean = df_clean.fillna('')
            
            # Convert to dict and clean each record
            records = df_clean.to_dict('records')
            for record in records:
                for key, value in record.items():
                    if isinstance(value, float):
                        if pd.isna(value) or value in [float('inf'), float('-inf')]:
                            record[key] = 0
                        else:
                            record[key] = float(value)
                    elif isinstance(value, (int, np.integer)):
                        record[key] = int(value)
                    elif pd.isna(value):
                        record[key] = ''
            
            return records

        # Prepare results with proper type conversion and validation
        results = {
            "fileName": file.filename,
            "fileSize": f"{(len(content) / 1024):.2f}",
            "processingTime": f"{processing_time:.2f}s",
            "totalPapers": int(total_papers),
            "surveyPapers": int(excluded_papers),
            "nonSurveyPapers": int(len(non_survey_df)),
            "totalCitations": int(total_citations),
            "excludedCitations": int(excluded_citations),
            "remainingCitations": int(total_citations - excluded_citations),
            "hIndexBefore": int(total_h_index),
            "hIndexAfter": int(non_survey_h_index),
            "i10Before": int(total_i10),
            "i10After": int(non_survey_i10),
            "percentPapersExcluded": f"{percent_papers_excluded:.2f}",
            "percentCitationsExcluded": f"{percent_citations_excluded:.2f}",
            "comparison": [
                ["Total Papers", int(total_papers), int(len(non_survey_df))],
                ["Total Citations", int(total_citations), int(total_citations - excluded_citations)],
                ["H-Index", int(total_h_index), int(non_survey_h_index)],
                ["i10-Index", int(total_i10), int(non_survey_i10)],
            ],
            "allSurveyData": clean_dataframe_for_json(survey_df),
            "allNonSurveyData": clean_dataframe_for_json(non_survey_df)
        }

        return JSONResponse(content=results)

    except Exception as e:
        # Error processing file
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
