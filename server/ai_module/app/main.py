# FastAPI app startup and error handling for the AI microservice.
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .api.routes import router


app = FastAPI(
    title="Event Rental AI Module",
    version="1.0.0",
    description="FastAPI AI service for image quality, category validation, similarity, damage detection, and penalty estimation.",
)

app.include_router(router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "error": str(exc) or "Internal server error",
            "path": str(request.url.path),
        },
    )
