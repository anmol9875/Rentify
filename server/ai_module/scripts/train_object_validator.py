from __future__ import annotations

import json
import random
import shutil
import sys
from collections import Counter, defaultdict
from pathlib import Path

CURRENT_FILE = Path(__file__).resolve()
PROJECT_ROOT = CURRENT_FILE.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ultralytics import YOLO

from app.config import (
    DEFAULT_OBJECT_CLASSES,
    OBJECT_PREPARED_DIR,
    OBJECT_TEST_DIR,
    OBJECT_TRAIN_DIR,
    OBJECT_VALIDATOR_WEIGHTS,
)

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}
KEYWORD_CANDIDATES = ("table", "chair", "desk", "sofa", "couch", "lamp", "stool")


def detect_image_for_label(images_dir: Path, label_path: Path) -> Path | None:
    stem = label_path.stem
    for suffix in IMAGE_SUFFIXES:
        candidate = images_dir / f"{stem}{suffix}"
        if candidate.exists():
            return candidate
    return None


def primary_class_id(label_path: Path) -> int | None:
    counts: Counter[int] = Counter()
    for line in label_path.read_text().splitlines():
        line = line.strip()
        if not line:
            continue
        counts[int(line.split()[0])] += 1
    if not counts:
        return None
    return counts.most_common(1)[0][0]


def collect_samples() -> list[dict]:
    samples: list[dict] = []
    for split_dir in (OBJECT_TRAIN_DIR, OBJECT_TEST_DIR):
        images_dir = split_dir / "images"
        labels_dir = split_dir / "labels"
        if not images_dir.exists() or not labels_dir.exists():
            continue

        for label_path in sorted(labels_dir.glob("*.txt")):
            image_path = detect_image_for_label(images_dir, label_path)
            class_id = primary_class_id(label_path)
            if image_path is None or class_id is None:
                continue
            samples.append(
                {
                    "image": image_path,
                    "label": label_path,
                    "class_id": class_id,
                }
            )

    if not samples:
        raise FileNotFoundError(
            "No YOLO samples found. Expected images/labels inside "
            f"{OBJECT_TRAIN_DIR} and/or {OBJECT_TEST_DIR}."
        )
    return samples


def infer_class_names(samples: list[dict]) -> list[str]:
    per_class_keywords: dict[int, Counter[str]] = defaultdict(Counter)
    max_class_id = max(sample["class_id"] for sample in samples)
    class_names = [f"class_{idx}" for idx in range(max_class_id + 1)]

    for sample in samples:
        stem = sample["image"].stem.lower()
        for keyword in KEYWORD_CANDIDATES:
            if keyword in stem:
                per_class_keywords[sample["class_id"]][keyword] += 1

    for class_id in range(max_class_id + 1):
        if per_class_keywords[class_id]:
            class_names[class_id] = per_class_keywords[class_id].most_common(1)[0][0]
        elif class_id < len(DEFAULT_OBJECT_CLASSES):
            class_names[class_id] = DEFAULT_OBJECT_CLASSES[class_id]

    return class_names


def build_split(samples: list[dict], seed: int = 42) -> dict[str, list[dict]]:
    grouped: dict[int, list[dict]] = defaultdict(list)
    for sample in samples:
        grouped[sample["class_id"]].append(sample)

    rng = random.Random(seed)
    train_samples: list[dict] = []
    val_samples: list[dict] = []
    test_samples: list[dict] = []

    for class_samples in grouped.values():
        rng.shuffle(class_samples)
        total = len(class_samples)

        test_count = max(1, round(total * 0.15)) if total >= 3 else 1
        val_count = max(1, round(total * 0.15)) if total >= 5 else 1

        test_subset = class_samples[:test_count]
        val_subset = class_samples[test_count : test_count + val_count]
        train_subset = class_samples[test_count + val_count :]

        if not train_subset and val_subset:
            train_subset.append(val_subset.pop())
        if not train_subset and test_subset:
            train_subset.append(test_subset.pop())

        train_samples.extend(train_subset)
        val_samples.extend(val_subset)
        test_samples.extend(test_subset)

    return {"train": train_samples, "val": val_samples, "test": test_samples}


def copy_split_files(split_map: dict[str, list[dict]]) -> None:
    if OBJECT_PREPARED_DIR.exists():
        shutil.rmtree(OBJECT_PREPARED_DIR)

    for split_name, split_samples in split_map.items():
        images_dir = OBJECT_PREPARED_DIR / split_name / "images"
        labels_dir = OBJECT_PREPARED_DIR / split_name / "labels"
        images_dir.mkdir(parents=True, exist_ok=True)
        labels_dir.mkdir(parents=True, exist_ok=True)

        for sample in split_samples:
            shutil.copy2(sample["image"], images_dir / sample["image"].name)
            shutil.copy2(sample["label"], labels_dir / sample["label"].name)


def write_data_yaml(class_names: list[str]) -> Path:
    data_yaml = OBJECT_PREPARED_DIR / "data.yaml"
    lines = [
        f"path: {OBJECT_PREPARED_DIR.resolve().as_posix()}",
        "train: train/images",
        "val: val/images",
        "test: test/images",
        f"nc: {len(class_names)}",
        f"names: {json.dumps(class_names)}",
        "",
    ]
    data_yaml.write_text("\n".join(lines), encoding="utf-8")
    return data_yaml


def train() -> None:
    samples = collect_samples()
    class_names = infer_class_names(samples)
    split_map = build_split(samples)
    copy_split_files(split_map)
    data_yaml = write_data_yaml(class_names)

    print(f"Prepared {len(samples)} samples in {OBJECT_PREPARED_DIR}")
    print(f"Using class names: {class_names}")

    model = YOLO("yolov8n.pt")
    results = model.train(
        data=str(data_yaml),
        epochs=10,
        imgsz=640,
        batch=8,
        device="cpu",
        workers=0,
        project=str((OBJECT_PREPARED_DIR / 'runs').resolve()),
        name="object_validator",
        exist_ok=True,
    )

    best_weights = Path(results.save_dir) / "weights" / "best.pt"
    if best_weights.exists():
        OBJECT_VALIDATOR_WEIGHTS.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(best_weights, OBJECT_VALIDATOR_WEIGHTS)
        print(f"Saved fine-tuned object validator to {OBJECT_VALIDATOR_WEIGHTS}")
    else:
        print("Training finished, but best.pt was not found.")


if __name__ == "__main__":
    train()
