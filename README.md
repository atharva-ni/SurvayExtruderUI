# SurvayExtruderU

An advanced AI-powered system to identify and filter survey papers from academic datasets using hybrid classification combining keyword matching with DistilBERT deep learning model.

## Features

- **Hybrid Classification**: Combines keyword-based detection with DistilBERT neural network
- **Real-time Processing**: Fast API backend with React frontend
- **Comprehensive Metrics**: H-index, i10-index, citation analysis
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **File Upload**: Drag-and-drop CSV file upload interface

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
# Run the automated startup script
start.bat
```

**Linux/Mac:**
```bash
# Make the script executable and run
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

1. **Install Frontend Dependencies:**
```bash
npm install
```

2. **Install Backend Dependencies:**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

3. **Start the Application:**
```bash
# Terminal 1: Start backend server
cd backend
python main.py

# Terminal 2: Start frontend
npm run dev
```

## Usage

1. **Access the Application**: Open http://localhost:5173 in your browser
2. **Upload CSV File**: Upload a CSV file with columns: `title`, `abstract`, `n_citation`
3. **Run Classification**: Click "Classify Survey Papers" to process your dataset
4. **View Results**: See detailed metrics including papers excluded, citations removed, and index changes

## API Endpoints

- `GET /` - API health check
- `GET /health` - Detailed health status
- `POST /classify` - Process CSV file and return classification results

## Project Structure

```
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Main API server
│   └── requirements.txt    # Python dependencies
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Application pages
│   └── ...
├── distilbert_survey_model/ # Pre-trained model files
├── start.bat              # Windows startup script
├── start.sh               # Linux/Mac startup script
└── package.json           # Node.js dependencies
```

## Technologies Used

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components

**Backend:**
- FastAPI
- Python 3.8+
- PyTorch
- Transformers (Hugging Face)
- Pandas
- scikit-learn

**AI/ML:**
- DistilBERT (DistilBERTForSequenceClassification)
- Hybrid keyword + neural network classification
- Survey paper detection algorithms

## Model Requirements

The application requires the `distilbert_survey_model` directory containing:
- `config.json`
- `model.safetensors`
- `tokenizer.json`
- `vocab.txt`
- Other model files

## CSV Format Requirements

Your input CSV must contain these columns:
- `title`: Paper title
- `abstract`: Paper abstract
- `n_citation`: Number of citations

## Development

**Frontend Development:**
```bash
npm run dev
```

**Backend Development:**
```bash
cd backend
python main.py
```

**Install Dependencies:**
```bash
# Frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

## Troubleshooting

1. **Backend not starting**: Ensure Python dependencies are installed
2. **Model not found**: Check that `distilbert_survey_model` directory exists
3. **CORS errors**: Backend runs on port 8000, frontend on port 5173
4. **File upload issues**: Ensure CSV has required columns

## License

This project is part of SurvayExtruderU for academic research.
