from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import database
import os

# Saare Routes Import karo
from app.routes import (
    employee_routes,
    job_routes,
    application_routes,
    leave_routes,
    attendance_routes,
)

app = FastAPI()

# PDF uploads ke liye static folder mount karo
os.makedirs("uploads/cv", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# --- CORS SETTING (Bohat Zaroori for Frontend Connection) ---
# Iske baghair React backend se baat nahi kar payega
origins = ["*"] # Abhi ke liye sab allow kardo
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "HR System Backend is Fully Ready!"}

# --- ROUTERS REGISTER KARO ---
app.include_router(employee_routes.router, prefix="/api/employee", tags=["Employee"])
app.include_router(job_routes.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(application_routes.router, prefix="/api/applications", tags=["Applications"])
app.include_router(leave_routes.router, prefix="/api/leaves", tags=["Leaves"])
app.include_router(attendance_routes.router, prefix="/api/attendance", tags=["Attendance"])