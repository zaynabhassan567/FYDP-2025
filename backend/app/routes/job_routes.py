from fastapi import APIRouter, HTTPException, Body
from app.models import JobModel
from app.database import job_collection
from typing import List

router = APIRouter()

# 1. CREATE JOB (HR Post karega)
@router.post("/create")
async def create_job(job: JobModel = Body(...)):
    new_job = await job_collection.insert_one(job.dict())
    return {"message": "Job Posted", "id": str(new_job.inserted_id)}

# 2. GET ALL JOBS (Frontend par dikhane ke liye)
@router.get("/all")
async def get_all_jobs():
    jobs = []
    # Sirf active jobs dikhao
    async for job in job_collection.find({"is_active": True}):
        job["_id"] = str(job["_id"])
        jobs.append(job)
    return jobs