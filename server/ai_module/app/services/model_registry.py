# Loads and caches AI models used by the damage, object, and similarity services.
from functools import lru_cache

import torch
from torchvision.models import ResNet18_Weights, resnet18
from transformers import CLIPModel, CLIPProcessor
from ultralytics import YOLO

from ..config import DAMAGE_CLASSES, DAMAGE_MODEL_WEIGHTS, OBJECT_VALIDATOR_WEIGHTS


class DamageClassifier:
    def __init__(self) -> None:
        self.device = torch.device("cpu")
        self.classes = DAMAGE_CLASSES
        weights = None if DAMAGE_MODEL_WEIGHTS.exists() else ResNet18_Weights.DEFAULT
        self.model = resnet18(weights=weights)
        self.model.fc = torch.nn.Linear(self.model.fc.in_features, len(self.classes))

        if DAMAGE_MODEL_WEIGHTS.exists():
            state_dict = torch.load(DAMAGE_MODEL_WEIGHTS, map_location=self.device)
            self.model.load_state_dict(state_dict)

        self.model.to(self.device)
        self.model.eval()
        self.transforms = ResNet18_Weights.DEFAULT.transforms()


@lru_cache(maxsize=1)
def get_yolo_model() -> YOLO:
    weights_path = OBJECT_VALIDATOR_WEIGHTS if OBJECT_VALIDATOR_WEIGHTS.exists() else "yolov8n.pt"
    return YOLO(str(weights_path))


@lru_cache(maxsize=1)
def get_clip_bundle() -> tuple[CLIPModel, CLIPProcessor]:
    model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    model.to("cpu")
    model.eval()
    return model, processor


@lru_cache(maxsize=1)
def get_damage_classifier() -> DamageClassifier:
    return DamageClassifier()
