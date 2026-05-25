# Compares two images using semantic and local visual features.
import cv2
import numpy as np
import torch
from PIL import Image

from .model_registry import get_clip_bundle


def _to_pil(image: np.ndarray) -> Image.Image:
    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)


def _semantic_similarity(original_image: np.ndarray, return_image: np.ndarray) -> float:
    model, processor = get_clip_bundle()

    inputs = processor(
        images=[_to_pil(original_image), _to_pil(return_image)],
        return_tensors="pt",
    )

    with torch.no_grad():
        features = model.get_image_features(pixel_values=inputs["pixel_values"])
        features = features / features.norm(dim=-1, keepdim=True)
        similarity = torch.nn.functional.cosine_similarity(features[0:1], features[1:2]).item()

    return float(similarity)


def _prepare_feature_image(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    normalized = clahe.apply(gray)
    height, width = normalized.shape[:2]
    largest_side = max(height, width)

    if largest_side <= 900:
        return normalized

    scale = 900 / largest_side
    return cv2.resize(normalized, (int(width * scale), int(height * scale)))


def _local_feature_similarity(original_image: np.ndarray, return_image: np.ndarray) -> float:
    before = _prepare_feature_image(original_image)
    after = _prepare_feature_image(return_image)
    orb = cv2.ORB_create(nfeatures=2000, fastThreshold=8)
    before_keypoints, before_descriptors = orb.detectAndCompute(before, None)
    after_keypoints, after_descriptors = orb.detectAndCompute(after, None)

    if before_descriptors is None or after_descriptors is None:
        return 0.0

    min_keypoints = min(len(before_keypoints), len(after_keypoints))
    if min_keypoints < 20:
        return 0.0

    matcher = cv2.BFMatcher(cv2.NORM_HAMMING)
    knn_matches = matcher.knnMatch(before_descriptors, after_descriptors, k=2)
    good_matches = []

    for match_pair in knn_matches:
        if len(match_pair) < 2:
            continue

        best, second_best = match_pair
        if best.distance < 0.78 * second_best.distance:
            good_matches.append(best)

    if len(good_matches) < 8:
        return 0.0

    score = len(good_matches) / max(1, min_keypoints)
    return float(min(score, 1.0))


def compare_images_with_clip(original_image: np.ndarray, return_image: np.ndarray) -> dict:
    semantic_score = _semantic_similarity(original_image, return_image)
    feature_score = _local_feature_similarity(original_image, return_image)
    normalized_feature_score = min(feature_score / 0.12, 1.0)
    combined_score = (semantic_score * 0.65) + (normalized_feature_score * 0.35)
    image_match = (
        semantic_score >= 0.84
        or (semantic_score >= 0.74 and feature_score >= 0.035)
        or feature_score >= 0.09
    )

    return {
        "similarity_score": round(float(combined_score), 4),
        "semantic_score": round(float(semantic_score), 4),
        "feature_score": round(float(feature_score), 4),
        "image_match": bool(image_match),
        "significant_change": not image_match,
    }
