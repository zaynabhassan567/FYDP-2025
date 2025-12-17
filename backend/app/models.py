from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# ============================
# 1. EMPLOYEE SCHEMA (Users)
# ============================
class EmployeeModel(BaseModel):
    full_name: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)
    employee_code: str = Field(..., min_length=4, description="Unique ID provided by HR")
    cnic: str = Field(..., min_length=13, max_length=13, description="CNIC number (13 digits, unique)")
    role: str = Field(default="Employee")  # Admin, HR, Employee
    salary: float = Field(default=0.0)
    mobile: Optional[str] = Field(default=None, description="Mobile number")
    # Joining date aur Paid leaves track karne ke liye
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    paid_leaves_total: int = Field(default=20)
    paid_leaves_used: int = Field(default=0)

# Model for Admin to add employee (without password/email initially)
class AddEmployeeModel(BaseModel):
    employee_code: str = Field(..., min_length=4, description="Unique ID provided by HR")
    cnic: str = Field(..., min_length=13, max_length=13, description="CNIC number (13 digits, unique)")
    full_name: Optional[str] = Field(default=None)
    role: str = Field(default="Employee")
    salary: float = Field(default=0.0)
    mobile: Optional[str] = Field(default=None)

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "Ali Raza",
                "email": "ali@company.com",
                "password": "strongpassword",
                "employee_code": "EMP001",
                "cnic": "1234567890123",
                "role": "Employee",
                "salary": 75000
            }
        }

# ============================
# 2. JOB OPENING SCHEMA
# ============================
class JobModel(BaseModel):
    title: str = Field(...)  # e.g., Senior React Developer
    description: str = Field(...)
    requirements: List[str] = Field(default=[])  # e.g., ["Python", "FastAPI"]
    location: str = Field(default="Karachi")
    salary_range: str = Field(default="Not Disclosed")
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Backend Developer",
                "description": "Need an expert in FastAPI",
                "requirements": ["Python", "MongoDB", "AWS"],
                "location": "Lahore"
            }
        }

# ============================
# 3. JOB APPLICATION SCHEMA (CVs)
# ============================
class ApplicationModel(BaseModel):
    job_id: str = Field(...)  # Kis job ke liye apply kiya
    candidate_name: str = Field(...)
    candidate_email: EmailStr = Field(...)
    cv_url: str = Field(...)  # Cloudinary ka link ayega yahan
    ai_score: int = Field(default=0)  # AI jo score degi (0-100)
    ai_reasoning: str = Field(default="")  # AI ka remarks
    status: str = Field(default="Pending")  # Pending, Shortlisted, Rejected
    applied_at: datetime = Field(default_factory=datetime.utcnow)

# ============================
# 4. LEAVE REQUEST SCHEMA
# ============================
class LeaveModel(BaseModel):
    employee_id: str = Field(...)  # Kon chutti mang raha hai
    start_date: datetime = Field(...)
    end_date: datetime = Field(...)
    reason: str = Field(...)
    leave_type: str = Field(default="Casual")  # Sick, Casual, Annual
    status: str = Field(default="Pending")  # Pending, Approved, Rejected
    admin_comments: Optional[str] = None


# ============================
# 5. ATTENDANCE SUMMARY (per month)
# ============================
class AttendanceModel(BaseModel):
    employee_id: str = Field(...)  # employee_code
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000)
    absent_days: int = Field(default=0)
    approved_leaves: int = Field(default=0)  # Auto-calculated from leaves database (Approved status only)
    paid_leaves: int = Field(default=0)  # Deprecated - not used in calculation
    daily_deduction: float = Field(default=0.0)
    unapproved_absence: int = Field(default=0)  # absent_days - approved_leaves (from leaves database)

    class Config:
        json_schema_extra = {
            "example": {
                "employee_id": "EMP001",
                "month": 5,
                "year": 2025,
                "absent_days": 3,
                "approved_leaves": 1,
                "paid_leaves": 1,
                "daily_deduction": 2500.0,
            }
        }