# API route definitions that connect HTTP requests to AI service functions.
from fastapi import APIRouter, File, Form, UploadFile

from ..schemas import (
    CategoryValidationResponse,
    CompareImagesResponse,
    DamageDetectionResponse,
    PenaltyRequest,
    PenaltyResponse,
    QualityCheckResponse,
    VerifyImageResponse,
)
from ..services.clip_service import compare_images_with_clip
from ..services.damage_service import detect_damage
from ..services.image_io import read_upload_image
from ..services.penalty_service import calculate_penalty
from ..services.quality_service import check_image_quality
from ..services.yolo_service import validate_object_category

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "event-rental-ai-module",
    }


@router.post("/verify-image", response_model=VerifyImageResponse)
async def verify_image(
    image: UploadFile = File(...),
    expected_category: str | None = Form(default=None),
) -> VerifyImageResponse:
    image_array = await read_upload_image(image)
    quality = check_image_quality(image_array)
    category_validation = validate_object_category(image_array, expected_category)

    return VerifyImageResponse(
        quality=QualityCheckResponse(**quality),
        category_validation=CategoryValidationResponse(**category_validation),
    )


@router.post("/compare-images", response_model=CompareImagesResponse)
async def compare_images(
    original_image: UploadFile = File(...),
    return_image: UploadFile = File(...),
) -> CompareImagesResponse:
    before = await read_upload_image(original_image)
    after = await read_upload_image(return_image)
    result = compare_images_with_clip(before, after)
    return CompareImagesResponse(**result)


@router.post("/detect-damage", response_model=DamageDetectionResponse)
async def detect_damage_endpoint(
    image: UploadFile = File(...),
) -> DamageDetectionResponse:
    image_array = await read_upload_image(image)
    result = detect_damage(image_array)
    return DamageDetectionResponse(**result)


@router.post("/calculate-penalty", response_model=PenaltyResponse)
def calculate_penalty_endpoint(payload: PenaltyRequest) -> PenaltyResponse:
    result = calculate_penalty(payload.damage_level, payload.item_price)
    return PenaltyResponse(**result)
