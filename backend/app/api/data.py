
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.csv_service import inspect_csv, preprocess_csv

router = APIRouter(prefix="/api/data", tags=["Data Management"])


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()

    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size must not exceed 10 MB.")

    try:
        result = inspect_csv(content)
        return {
            "message": "CSV uploaded and analyzed successfully.",
            "filename": file.filename,
            "data": result
        }
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

@router.post("/preprocess")
async def preprocess_uploaded_csv(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported."
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size must not exceed 10 MB."
        )

    try:
        result = preprocess_csv(content)

        return {
            "message": "CSV preprocessing completed successfully.",
            "filename": file.filename,
            "data": result
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

