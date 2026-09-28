# SurvayExtruderU

Web interface for the survey-paper classifier from [SurvayExtruderModel](https://github.com/atharva-ni/SurvayExtruderModel).
Upload a publication list (CSV) and the app shows which papers are surveys, and how the h-index, i10-index
and citation count change without them.

## How it classifies

- **DistilBERT**, fine-tuned on 9,624 real papers (surveys from survey-only journals vs. research papers from
  topic- and year-matched research journals), estimates how likely each paper is a survey from its title and abstract.
- A **learned hybrid** combines that score with title keywords, survey/research phrasing in the abstract and the
  reference count.
- Each paper then gets one **category**:

| Category | Meaning | Default |
|---|---|---|
| `survey` | Survey, tutorial or review | Excluded |
| `non-paper` | Book, editorial, erratum (from publication type or title) | Excluded |
| `magazine-overview` | Magazine article flagged by the model that does not call itself a survey | Kept (optional switch to exclude) |
| `research` | Original research | Kept |

Papers with only a title (no abstract, venue or type) count as surveys only if the title says so.
Measured performance: 95% accuracy on 1,925 held-out papers; 96% of unseen papers on five authors'
Google Scholar top-20 lists classified correctly. See the model repository's `reports/` for details.

## Prerequisites

- Node.js 18 or later
- Python 3.10 or later (tested with 3.14)
- The trained model (see below)

## Model setup

The model is not stored in this repository (it is ~270 MB). Copy these files from the model repository's
`distilbert_survey_model/` folder (created by `python main.py train` there) into `backend/distilbert_survey_model/`:

```
config.json   model.safetensors   tokenizer.json   tokenizer_config.json
survey_config.json   hybrid_combiner.joblib
```

The backend refuses to start if any of them is missing. To use a model stored elsewhere, set
`SURVEY_MODEL_PATH` to its folder.

The classification code in `backend/pipeline/` is a copy of the model repository's `src/` modules
(see `backend/pipeline/README.md` for the commit). After retraining or changing the rules there,
copy both the model files and those modules again.

## Quick start

**Windows:** `start.bat`  **Linux/Mac:** `./start.sh`

Or manually:

```bash
# Backend (terminal 1)
cd backend
pip install -r requirements.txt
python main.py            # http://127.0.0.1:8000

# Frontend (terminal 2)
npm install
npm run dev               # http://localhost:8080
```

Open http://localhost:8080 and choose **Classification**.

For GPU inference, install the CUDA build of PyTorch before the requirements
(see the comment at the top of `backend/requirements.txt`).

## CSV format

| Column | Required | Accepted names |
|---|---|---|
| Title | yes | `title` |
| Citation count | yes | `n_citation`, `citations`, `citationCount`, `cited_by_count`, … |
| Abstract | recommended | `abstract` |
| Venue | recommended (needed for the magazine rule) | `venue`, `journal`, `source` |
| Publication type | recommended (detects books and editorials) | `type`, `publicationTypes` |
| References | optional | `ReferenceCount`, or `references` as a `;`-separated list |

Files exported by the model repository (`python main.py extract …`) work as they are. Maximum upload: 50 MB.

## API

- `GET /health`: model status, device and thresholds
- `POST /classify`: multipart form with
  - `file`: the CSV
  - `exclude_magazine_overviews`: `true` / `false` (default `false`)
  - `mode`: `learned` (default), `or`, `model` or `keyword`

  Returns counts per category, metrics before and after exclusion, and the kept and excluded papers,
  each with `Category`, `SurveyScore` and `Prediction` (1 = kept, 0 = excluded).

The backend listens on 127.0.0.1 only. Set `HOST=0.0.0.0` to make it reachable from other machines, and
`VITE_API_URL` (frontend) if it runs on a different address than `http://localhost:8000`.

## Project structure

```
├── backend/
│   ├── main.py                    # FastAPI server
│   ├── pipeline/                  # Classification code copied from the model repository
│   ├── distilbert_survey_model/   # Trained model (not in git; see Model setup)
│   └── requirements.txt
├── src/                           # React frontend (Vite, TypeScript, Tailwind, shadcn/ui)
├── sample_data.csv                # Small example input
├── start.bat / start.sh
└── package.json
```

## Troubleshooting

1. **Backend exits at startup:** a model file is missing; see Model setup.
2. **"Cannot reach the backend":** start it with `cd backend && python main.py`.
3. **CORS errors:** the backend allows the frontend on ports 8080, 8081, 5173 and 3000.
4. **"CSV must contain a title column…":** check the column names against the table above.
