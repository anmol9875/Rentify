# Uses the YOLO model to detect what objects are in an uploaded image.
import cv2

from ..config import EXPECTED_CATEGORY_ALIASES
from .model_registry import get_yolo_model


def validate_object_category(image, expected_category: str | None) -> dict:
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    model = get_yolo_model()
    results = model.predict(source=rgb_image, verbose=False, device="cpu")

    detected_objects: list[str] = []
    for result in results:
        for cls_id in result.boxes.cls.tolist():
            detected_objects.append(model.names[int(cls_id)])

    detected_objects = sorted(set(detected_objects))

    if not expected_category:
        return {
            "detected_objects": detected_objects,
            "matches_expected": len(detected_objects) > 0,
        }

    expected_key = expected_category.strip().lower()
    aliases = EXPECTED_CATEGORY_ALIASES.get(expected_key, {expected_key})
    matches_expected = any(obj.lower() in aliases for obj in detected_objects)

    return {
        "detected_objects": detected_objects,
        "matches_expected": matches_expected,
    }
