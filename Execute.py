import os
import time
import pandas as pd
import torch
from typing import List, Tuple
from tabulate import tabulate
from torch.utils.data import Dataset, DataLoader
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
from torch.amp import autocast

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
    model = DistilBertForSequenceClassification.from_pretrained(
        model_path, ignore_mismatched_sizes=True
    )
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

            with autocast("cuda" if device.type == "cuda" else "cpu"):
                outputs = model(input_ids=input_ids, attention_mask=attention_mask)
                logits = outputs.logits
                probs = torch.nn.functional.softmax(logits, dim=-1)
                survey_probs = probs[:, 0].cpu().numpy()  # class 0 = survey

            all_probs.extend(survey_probs)

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
    h_index = sum(c >= (i + 1) for i, c in enumerate(citations))
    i10_index = sum(c >= 10 for c in citations)
    return h_index, i10_index

# ---------------- Main Filtering Pipeline ---------------- #
def exclude_predicted_surveys(
    input_csv: str,
    output_csv: str,
    survey_csv: str = 'Survey-Papers.csv',
    model_path: str = './distilbert_survey_model'
) -> None:
    if not os.path.exists(input_csv):
        raise FileNotFoundError(f"Input CSV file not found: {input_csv}")

    df = pd.read_csv(input_csv)
    print("✅ Loaded CSV with columns:", df.columns.tolist())

    required_cols = {'title', 'abstract', 'n_citation'}
    if not required_cols.issubset(df.columns):
        raise KeyError(f"CSV must contain the columns: {required_cols}")

    # Clean empty entries
    df = df.dropna(subset=['title', 'abstract', 'n_citation'])
    df = df[~df[['title', 'abstract']].apply(lambda x: x.str.strip().eq('').any(), axis=1)]
    print(f"🧹 Cleaned dataset: {len(df)} valid rows remaining after removing empty entries.\n")

    df['Prediction'] = classify_with_hybrid_model(df, model_path)

    survey_df = df[df['Prediction'] == 0]
    non_survey_df = df[df['Prediction'] == 1].drop(columns=['Prediction'])

    non_survey_df.to_csv(output_csv, index=False)
    survey_df.to_csv(survey_csv, index=False)  # ✅ Save survey papers

    total_papers = len(df)
    excluded_papers = len(survey_df)
    excluded_citations = survey_df['n_citation'].fillna(0).astype(int).sum()
    total_citations = df['n_citation'].fillna(0).astype(int).sum()

    percent_papers_excluded = (excluded_papers / total_papers) * 100 if total_papers else 0
    percent_citations_excluded = (excluded_citations / total_citations) * 100 if total_citations else 0

    total_h_index, total_i10 = calculate_indices(df)
    non_survey_h_index, non_survey_i10 = calculate_indices(non_survey_df)

    print(f"\n📊 Papers excluded as surveys: {excluded_papers} ({percent_papers_excluded:.2f}%)")
    print(f"📉 Citations excluded: {excluded_citations} ({percent_citations_excluded:.2f}%)")

    comparison = [
        ["Total Papers", total_papers, len(non_survey_df)],
        ["Total Citations", total_citations, total_citations - excluded_citations],
        ["H-Index", total_h_index, non_survey_h_index],
        ["i10-Index", total_i10, non_survey_i10],
    ]

    print("\n📋 Comparison Table:")
    print(tabulate(comparison, headers=["Metric", "With Surveys", "Without Surveys"], tablefmt="grid"))

# ---------------- Entry Point ---------------- #
if __name__ == "__main__":
    input_csv = 'auth1.csv'
    output_csv = 'Non-Survey-Papers.csv'
    survey_csv = 'Survey-Papers.csv'
    model_dir = './distilbert_survey_model'

    exclude_predicted_surveys(input_csv, output_csv, survey_csv, model_path=model_dir)
    print(f"\n✅ Cleaned non-survey papers saved to: '{output_csv}'")
    print(f"✅ Survey papers saved to: '{survey_csv}'")
