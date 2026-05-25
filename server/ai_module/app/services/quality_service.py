# Checks image blur and brightness to decide whether a photo is usable.
import cv2
import numpy as np

from ..config import BLUR_THRESHOLD, BRIGHTNESS_THRESHOLD


def check_image_quality(image: np.ndarray) -> dict:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    laplacian_variance = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness_score = float(np.mean(gray))

    is_blurry = laplacian_variance < BLUR_THRESHOLD
    is_too_dark = brightness_score < BRIGHTNESS_THRESHOLD

    return {
        "is_blurry": is_blurry,
        "is_too_dark": is_too_dark,
        "is_usable": not is_blurry and not is_too_dark,
        "laplacian_variance": round(laplacian_variance, 2),
        "brightness_score": round(brightness_score, 2),
    }
