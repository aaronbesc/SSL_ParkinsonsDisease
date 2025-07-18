from fastapi import FastAPI, HTTPException, Query, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import os
import shutil

# setting up recording directory
RECORDINGS_DIR = os.path.join(os.path.dirname(__file__), "recordings")
os.makedirs(RECORDINGS_DIR, exist_ok=True)

# Import from your patient_manager module
from patient_manager import (
    Patient, PatientManager,
    async_create_patient, async_get_patient_info,
    async_update_patient_info, async_delete_patient_record,
    async_get_all_patients_info, async_search_patients,
    async_filter_patients
)

app = FastAPI(title="Patient Management API")

# Configure CORS to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Adjust this in production to your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request/response validation
class PatientCreate(BaseModel):
    name: str
    age: int = Field(..., ge=0, le=120)
    height: str = Field(..., min_length=1)
    weight: str = Field(..., min_length=1)
    lab_results: Optional[Dict] = Field(default_factory=dict)
    doctors_notes: Optional[str] = ""
    severity: str = Field("low", pattern="^(low|medium|high)$")


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=0, le=120)
    height: Optional[str] = None
    weight: Optional[str] = None
    lab_results: Optional[Dict] = None
    doctors_notes: Optional[str] = None
    severity: Optional[str] = Field(None, pattern="^(low|medium|high)$")


class PatientResponse(BaseModel):
    patient_id: str
    name: str
    age: int
    height: float
    weight: float
    lab_results: Dict
    doctors_notes: str
    severity: str


class PatientsListResponse(BaseModel):
    success: bool
    patients: List[PatientResponse]
    total: int
    skip: int
    limit: int


class PatientSearchResponse(BaseModel):
    success: bool
    patients: List[PatientResponse]
    count: int


class FilterCriteria(BaseModel):
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    severity: Optional[str] = None


# API Routes
@app.get("/")
async def root():
    return {"message": "Welcome to the Patient Management API"}


@app.post("/patients/", response_model=Dict)
async def create_patient(patient: PatientCreate):
    result = await async_create_patient(
        name=patient.name,
        age=patient.age,
        height=patient.height,
        weight=patient.weight,
        lab_results=patient.lab_results,
        doctors_notes=patient.doctors_notes,
        severity=patient.severity
    )

    if not result.get("success", False):
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to create patient"))

    return result


@app.get("/patients/", response_model=PatientsListResponse)
async def get_patients(
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000)
):
    return await async_get_all_patients_info(skip, limit)


@app.get("/patients/{patient_id}", response_model=Dict)
async def get_patient(patient_id: str):
    result = await async_get_patient_info(patient_id)

    if not result.get("success", False):
        raise HTTPException(status_code=404, detail="Patient not found")

    return result


@app.put("/patients/{patient_id}", response_model=Dict)
async def update_patient(patient_id: str, patient_update: PatientUpdate):
    # Convert Pydantic model to dict, excluding None values
    update_data = {k: v for k, v in patient_update.dict().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid update data provided")

    result = await async_update_patient_info(patient_id, update_data)

    if not result.get("success", False):
        if "errors" in result:
            raise HTTPException(status_code=400, detail=result["errors"])
        raise HTTPException(status_code=404, detail=result.get("error", "Failed to update patient"))

    return result


@app.delete("/patients/{patient_id}", response_model=Dict)
async def delete_patient(patient_id: str):
    result = await async_delete_patient_record(patient_id)

    if not result.get("success", False):
        raise HTTPException(status_code=404, detail="Patient not found")

    return result


@app.get("/patients/search/{query}", response_model=PatientSearchResponse)
async def search_patients_endpoint(query: str):
    return await async_search_patients(query)


@app.post("/patients/filter/", response_model=PatientSearchResponse)
async def filter_patients_endpoint(criteria: FilterCriteria):
    return await async_filter_patients(criteria.dict(exclude_none=True))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

@app.post("/upload-video/")
async def upload_video(
    patient_id: str = Form(...),
    test_name: str = Form(...),
    video: UploadFile = File(...)
):
    try:
        now_str = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"{patient_id}_{test_name}_{now_str}.mov"
        filepath = os.path.join(RECORDINGS_DIR, filename)

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)

        return {
            "success": True,
            "filename": filename,
            "path": f"recordings/{filename}",
            "patient_id": patient_id,
            "test_name": test_name
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    
@app.get("/videos/{patient_id}/{test_name}", response_model=Dict)
def list_videos(patient_id: str, test_name: str):
    try:
        files = os.listdir(RECORDINGS_DIR)
        matching = [
            f for f in files
            if f.startswith(f"{patient_id}_{test_name}_") and f.endswith(".mov")
        ]
        matching.sort(
            key=lambda f: os.path.getmtime(os.path.join(RECORDINGS_DIR, f)),
            reverse=True
        )
        return {"success": True, "videos": matching}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/recordings/{filename}", response_class=FileResponse)
def get_recording_file(filename: str):
    file_path = os.path.join(RECORDINGS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(file_path, media_type="video/quicktime")
