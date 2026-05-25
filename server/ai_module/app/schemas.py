# Pydantic data schemas defining the shape of AI API responses and payloads.
from typing import List

from pydantic import BaseModel
# uses Pydantic models to define the structure of the data for the AI module'
#  enforce structure, validate data types, make sure everything is clean and predictable

class QualityCheckResponse(BaseModel):
    is_blurry: bool
    is_too_dark: bool
    is_usable: bool
    laplacian_variance: float
    brightness_score: float


class CategoryValidationResponse(BaseModel):
    detected_objects: List[str]
    matches_expected: bool


class VerifyImageResponse(BaseModel):
    quality: QualityCheckResponse
    category_validation: CategoryValidationResponse


class CompareImagesResponse(BaseModel):
    similarity_score: float
    significant_change: bool
    image_match: bool
    semantic_score: float
    feature_score: float


class DamageDetectionResponse(BaseModel):
    damage_level: str
    confidence: float


class PenaltyRequest(BaseModel):
    damage_level: str
    item_price: float


class PenaltyResponse(BaseModel):
    penalty_amount: float
    penalty_range: List[float]
