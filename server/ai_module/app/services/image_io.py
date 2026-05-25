# Utility functions for reading uploaded images and converting them into arrays.
from io import BytesIO

import cv2
import numpy as np
from fastapi import HTTPException, UploadFile
from PIL import Image


async def read_upload_image(file: UploadFile) -> np.ndarray:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        image = Image.open(BytesIO(content)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {exc}") from exc

    image_array = np.array(image)
    return cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
