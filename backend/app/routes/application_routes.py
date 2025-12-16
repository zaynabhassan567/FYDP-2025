from fastapi import APIRouter, Body, UploadFile, File, Form, HTTPException
from pydantic import EmailStr
from uuid import uuid4
from bson import ObjectId
import os
from app.models import ApplicationModel
from app.database import application_collection

router = APIRouter()

# 1. APPLY FOR JOB (Candidate CV upload karega)
@router.post("/apply")
async def apply_for_job(app: ApplicationModel = Body(...)):
    # TODO: Yahan baad mein AI ka code ayega jo score calculate karega
    # Abhi hum dummy score save kar rahe hain
    app.ai_score = 85 
    
    new_app = await application_collection.insert_one(app.dict())
    return {"message": "Application Submitted", "id": str(new_app.inserted_id)}


# 1.b APPLY FOR JOB WITH PDF FILE
@router.post("/apply-file")
async def apply_for_job_with_file(
    job_id: str = Form(...),
    candidate_name: str = Form(...),
    candidate_email: EmailStr = Form(...),
    file: UploadFile = File(...),
):
    # Sirf PDF allow karo
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Upload directory ensure karo
    upload_dir = os.path.join("uploads", "cv")
    os.makedirs(upload_dir, exist_ok=True)

    # Unique filename
    filename = f"{uuid4().hex}.pdf"
    file_path = os.path.join(upload_dir, filename)

    file_bytes = await file.read()
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Static URL jo frontend use karega
    cv_url = f"/static/cv/{filename}"

    app_obj = ApplicationModel(
        job_id=job_id,
        candidate_name=candidate_name,
        candidate_email=candidate_email,
        cv_url=cv_url,
    )

    new_app = await application_collection.insert_one(app_obj.dict())
    return {
        "message": "Application Submitted",
        "id": str(new_app.inserted_id),
        "cv_url": cv_url,
    }

# 2. GET APPLICATIONS FOR A JOB (HR dekhega)
@router.get("/{job_id}")
async def get_applications_by_job(job_id: str):
    apps = []
    async for app in application_collection.find({"job_id": job_id}):
        app["_id"] = str(app["_id"])
        apps.append(app)
    return apps


# 3. UPDATE APPLICATION STATUS (Shortlist / Reject)
@router.patch("/{application_id}/status")
async def update_application_status(application_id: str, payload: dict = Body(...)):
    status = payload.get("status")
    if status not in {"Pending", "Unviewed", "Viewed", "Shortlisted", "Rejected"}:
        raise HTTPException(status_code=400, detail="Invalid status value")

    try:
        obj_id = ObjectId(application_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application id")

    result = await application_collection.update_one(
        {"_id": obj_id},
        {"$set": {"status": status}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")

    return {"message": "Status updated", "status": status}