from fastapi import APIRouter, HTTPException, Body, Depends
from app.models import EmployeeModel, AddEmployeeModel
from app.database import employee_collection
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import JWTError, jwt

# --- 1. ROUTER SABSE PEHLE DEFINE HONA CHAHIYE ---
router = APIRouter()

# --- CONFIGURATION ---
SECRET_KEY = "supersecretkey_for_fyp_project" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- HELPER FUNCTIONS ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- SCHEMAS ---
class LoginSchema(BaseModel):
    email: str
    password: str

# --- API ROUTES ---

# 1. ADD EMPLOYEE (Admin only - creates employee record without password/email)
@router.post("/add")
async def add_employee(employee: AddEmployeeModel = Body(...)):
    """Admin adds employee with CNIC and employee_code. Employee will complete signup later."""
    # Validate CNIC
    if not employee.cnic or len(employee.cnic) != 13 or not employee.cnic.isdigit():
        raise HTTPException(status_code=400, detail="CNIC must be exactly 13 digits")
    
    # Check if CNIC already exists
    existing_cnic = await employee_collection.find_one({"cnic": employee.cnic})
    if existing_cnic:
        raise HTTPException(status_code=400, detail="CNIC already exists!")
    
    # Check if employee_code already exists
    existing_code = await employee_collection.find_one({"employee_code": employee.employee_code})
    if existing_code:
        raise HTTPException(status_code=400, detail="Employee code already exists!")
    
    # Create employee record (without password and email - will be added during signup)
    emp_data = {
        "employee_code": employee.employee_code,
        "cnic": employee.cnic,
        "full_name": employee.full_name or "",
        "role": employee.role,
        "salary": employee.salary,
        "mobile": employee.mobile,
        "email": "",  # Will be set during signup
        "password": "",  # Will be set during signup
        "joined_at": datetime.utcnow(),
        "paid_leaves_total": 20,
        "paid_leaves_used": 0
    }
    
    new_employee = await employee_collection.insert_one(emp_data)
    return {"message": "Employee added successfully", "id": str(new_employee.inserted_id)}

# 2. SIGNUP API (Employee completes their profile)
@router.post("/signup")
async def signup_employee(employee: EmployeeModel = Body(...)):
    """Employee signup - verifies CNIC and employee_code match existing record, then updates with email/password"""
    # Validate CNIC
    if not employee.cnic or len(employee.cnic) != 13 or not employee.cnic.isdigit():
        raise HTTPException(status_code=400, detail="CNIC must be exactly 13 digits")
    
    # Find existing employee by CNIC and employee_code
    existing_emp = await employee_collection.find_one({
        "cnic": employee.cnic,
        "employee_code": employee.employee_code
    })
    
    if not existing_emp:
        raise HTTPException(
            status_code=403, 
            detail="User not enrolled as employee. Please contact administrator."
        )
    
    # Check if already signed up (has email/password)
    if existing_emp.get("email") and existing_emp.get("password"):
        raise HTTPException(status_code=400, detail="Employee already signed up. Please login instead.")
    
    # Check if email is already used by another employee
    if employee.email:
        email_check = await employee_collection.find_one({
            "email": employee.email,
            "_id": {"$ne": existing_emp["_id"]}
        })
        if email_check:
            raise HTTPException(status_code=400, detail="Email already exists!")
    
    # Hash password
    hashed_password = pwd_context.hash(employee.password)
    
    # Update existing employee record with signup details
    update_data = {
        "email": employee.email,
        "password": hashed_password,
        "full_name": employee.full_name,
        "mobile": employee.mobile or existing_emp.get("mobile")
    }
    
    # Update other fields if provided
    if employee.role:
        update_data["role"] = employee.role
    if employee.salary:
        update_data["salary"] = employee.salary
    
    await employee_collection.update_one(
        {"_id": existing_emp["_id"]},
        {"$set": update_data}
    )
    
    return {"message": "Employee signup completed successfully", "id": str(existing_emp["_id"])}

# 2. LOGIN API
@router.post("/login")
async def login_employee(creds: LoginSchema = Body(...)):
    # A. User dhoondo
    user = await employee_collection.find_one({"email": creds.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # B. Password match karo
    if not pwd_context.verify(creds.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect Password")

    # C. JWT Token Generate karo
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"], "id": str(user["_id"])}
    )

    # D. Token wapis bhejo
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_role": user.get("role", "Employee"),
        "user_name": user.get("full_name", ""),
        "employee_id": str(user.get("_id")),
        "employee_code": user.get("employee_code", ""),
        "salary": user.get("salary", 0.0)
    }


# 3. GET ALL EMPLOYEES (Admin view)
@router.get("/all")
async def get_all_employees():
    employees = []
    async for emp in employee_collection.find():
        emp["_id"] = str(emp["_id"])
        # Password ko kabhi expose nahi karna
        emp.pop("password", None)
        employees.append(emp)
    return employees


@router.get("/{employee_code}")
async def get_employee_by_code(employee_code: str):
    """Get a single employee by their employee_code."""
    emp = await employee_collection.find_one({"employee_code": employee_code})
    if not emp:
        # try by _id
        try:
            from bson import ObjectId
            emp = await employee_collection.find_one({"_id": ObjectId(employee_code)})
        except Exception:
            emp = None

    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    emp.pop("password", None)
    emp["_id"] = str(emp["_id"])
    return emp

# 4. UPDATE EMPLOYEE (Admin can update employee details)
@router.patch("/{employee_code}")
async def update_employee(employee_code: str, update_data: dict = Body(...)):
    """Update employee details by employee_code."""
    from bson import ObjectId
    
    # Find employee by employee_code first
    emp = await employee_collection.find_one({"employee_code": employee_code})
    if not emp:
        # Try by _id
        try:
            emp = await employee_collection.find_one({"_id": ObjectId(employee_code)})
        except Exception:
            emp = None
    
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Don't allow password update through this endpoint (use separate endpoint if needed)
    update_data.pop("password", None)
    update_data.pop("_id", None)  # Don't allow _id update
    
    # Don't allow updating restricted fields (salary, role, cnic, employee_code)
    # These can only be changed by administrator
    update_data.pop("salary", None)
    update_data.pop("role", None)
    update_data.pop("cnic", None)
    update_data.pop("employee_code", None)
    
    # Note: Employee can only update: full_name, email, mobile
    
    # Update employee
    result = await employee_collection.update_one(
        {"_id": emp["_id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Return updated employee
    updated_emp = await employee_collection.find_one({"_id": emp["_id"]})
    updated_emp.pop("password", None)
    updated_emp["_id"] = str(updated_emp["_id"])
    return updated_emp