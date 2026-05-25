# Runs the damage classifier model to predict damage severity from a photo.
import cv2
import torch
from PIL import Image

from .model_registry import get_damage_classifier


def detect_damage(image) -> dict:
    classifier = get_damage_classifier()
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb)

    tensor = classifier.transforms(pil_image).unsqueeze(0).to(classifier.device)

    with torch.no_grad():
        logits = classifier.model(tensor)
        probabilities = torch.softmax(logits, dim=1)
        confidence, class_index = torch.max(probabilities, dim=1)

    return {
        "damage_level": classifier.classes[class_index.item()],
        "confidence": round(float(confidence.item()), 4),
    }
