# Configuration values, file paths and thresholds for AI checks and models.
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
TEST_IMAGES_DIR = DATA_DIR / "test_images"
RAW_DATASET_DIR = DATA_DIR / "datasets"
DEFAULT_DAMAGE_DATASET_DIR = DATA_DIR / "datasets" / "damage_dataset"
DATASET_DIR = (
    DEFAULT_DAMAGE_DATASET_DIR
    if DEFAULT_DAMAGE_DATASET_DIR.exists()
    else RAW_DATASET_DIR
)
OBJECT_TRAIN_DIR = RAW_DATASET_DIR / "train"
OBJECT_TEST_DIR = RAW_DATASET_DIR / "test"
PREPARED_DATA_DIR = DATA_DIR / "prepared"
OBJECT_PREPARED_DIR = PREPARED_DATA_DIR / "object_validation"
CHECKPOINT_DIR = BASE_DIR / "models" / "checkpoints"
DAMAGE_MODEL_WEIGHTS = CHECKPOINT_DIR / "damage_classifier.pt"
OBJECT_VALIDATOR_WEIGHTS = CHECKPOINT_DIR / "object_validator.pt"

BLUR_THRESHOLD = 80.0
BRIGHTNESS_THRESHOLD = 45.0
SIMILARITY_THRESHOLD = 0.92

DAMAGE_CLASSES = ["no_damage", "minor", "major", "critical"]
DEFAULT_OBJECT_CLASSES = ["class_0", "table"]

EXPECTED_CATEGORY_ALIASES = {
    "chair": {"chair", "dining chair"},
    "table": {"table", "dining table"},
    "couch": {"couch", "sofa"},
    "lamp": {"lamp"},
    "vase": {"vase"},
    "bottle": {"bottle"},
    "cup": {"cup", "wine glass"},
}
