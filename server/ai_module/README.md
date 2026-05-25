# Event Rental AI Module

FastAPI-based AI service for your Event Rental System / Rentify project.

## Features

- Image quality check
  - blur detection using variance of Laplacian
  - brightness detection using mean intensity
- Object category validation
  - pretrained YOLOv8 (`yolov8n.pt`)
  - optional fine-tuning using the uploaded YOLO dataset in `data/datasets/train` and `data/datasets/test`
- Before vs after similarity
  - pretrained CLIP image encoder
- Damage detection
  - ResNet18 classifier with optional fine-tuned weights
- Penalty engine
  - rule-based penalty ranges and suggested amount

## Project Structure

```text
server/ai_module/
├── app.py
├── requirements.txt
├── README.md
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── schemas.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py
│   └── services/
│       ├── __init__.py
│       ├── model_registry.py
│       ├── image_io.py
│       ├── quality_service.py
│       ├── yolo_service.py
│       ├── clip_service.py
│       ├── damage_service.py
│       └── penalty_service.py
├── scripts/
│   └── train_damage_model.py
├── data/
│   ├── datasets/
│   │   └── README.md
│   └── test_images/
│       ├── before_demo.png
│       ├── after_demo.png
│       └── blurry_dark_demo.png
└── models/
    └── checkpoints/
        └── README.md
```

## Dataset Upload Location

### A. Damage Detection Dataset

Upload your 4-class damage-severity dataset here:

```text
server/ai_module/data/datasets/damage_dataset/
```

Recommended structure for training:

```text
damage_dataset/
├── train/
│   ├── no_damage/
│   ├── minor/
│   ├── major/
│   └── critical/
└── val/
    ├── no_damage/
    ├── minor/
    ├── major/
    └── critical/
```

After training, save the model weights here:

```text
server/ai_module/models/checkpoints/damage_classifier.pt
```

### B. Object Validation Dataset

Your current upload already matches this YOLO format:

```text
server/ai_module/data/datasets/
├── train/
│   ├── images/
│   └── labels/
└── test/
    ├── images/
    └── labels/
```

That dataset is now used by:

- `scripts/train_object_validator.py`
- the YOLO object-category validation service

Run:

```powershell
python scripts/train_object_validator.py
```

This writes fine-tuned weights to:

```text
server/ai_module/models/checkpoints/object_validator.pt
```

## Local Setup

```powershell
cd server/ai_module
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/train_object_validator.py
python app.py
```

API base URL:

```text
http://localhost:5001
```

Docs:

```text
http://localhost:5001/docs
```

## Endpoints

### 1. Verify Image

`POST /verify-image`

Form-data:

- `image`: file
- `expected_category`: optional string such as `chair`, `table`

Response:

```json
{
  "quality": {
    "is_blurry": false,
    "is_too_dark": false,
    "is_usable": true,
    "laplacian_variance": 210.7,
    "brightness_score": 132.4
  },
  "category_validation": {
    "detected_objects": ["chair"],
    "matches_expected": true
  }
}
```

### 2. Compare Images

`POST /compare-images`

Form-data:

- `original_image`: file
- `return_image`: file

### 3. Detect Damage

`POST /detect-damage`

Form-data:

- `image`: file

### 4. Calculate Penalty

`POST /calculate-penalty`

JSON:

```json
{
  "damage_level": "major",
  "item_price": 25000
}
```

## Example cURL Requests

### Verify Image

```bash
curl -X POST "http://localhost:5001/verify-image" \
  -F "image=@data/test_images/before_demo.png" \
  -F "expected_category=chair"
```

### Compare Images

```bash
curl -X POST "http://localhost:5001/compare-images" \
  -F "original_image=@data/test_images/before_demo.png" \
  -F "return_image=@data/test_images/after_demo.png"
```

### Detect Damage

```bash
curl -X POST "http://localhost:5001/detect-damage" \
  -F "image=@data/test_images/after_demo.png"
```

### Calculate Penalty

```bash
curl -X POST "http://localhost:5001/calculate-penalty" \
  -H "Content-Type: application/json" \
  -d "{\"damage_level\":\"minor\",\"item_price\":15000}"
```

## Notes

- YOLO and CLIP weights are loaded in CPU mode.
- Your uploaded `train/test` dataset is now wired into YOLO object-validator training.
- Damage classifier works immediately, but real accuracy requires fine-tuned weights.
- Until you upload a 4-class severity dataset and train the classifier, `detect-damage` is functional but not production-accurate.
