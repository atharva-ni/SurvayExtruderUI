# Classification pipeline (vendored)

These modules are unmodified copies from the model repository
[atharva-ni/SurvayExtruderModel](https://github.com/atharva-ni/SurvayExtruderModel), `src/`, commit `242f8a1`:

| File | Purpose |
|---|---|
| `text_utils.py` | Text cleaning, keyword and venue patterns |
| `inference.py` | Model loading and batched survey-probability inference |
| `hybrid.py` | OR rule and the learned hybrid combiner |
| `classifier.py` | Categorization rules (survey / magazine-overview / non-paper / research) and h-index / i10-index |

Keep them in sync with the model repository: after retraining or changing the rules there,
copy these four files and the model folder (see the main README) again, and update the commit above.
