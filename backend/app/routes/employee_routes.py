from fastapi import APIRouter, HTTPException, Body, Depends
from app.models import EmployeeModel
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

# 1. SIGNUP API
@router.post("/signup")
async def signup_employee(employee: EmployeeModel = Body(...)):
    # Check email
    existing_user = await employee_collection.find_one({"email": employee.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists!")

    # Hash password
    hashed_password = pwd_context.hash(employee.password)
    employee.password = hashed_password
    
    # Save to DB
    new_employee = await employee_collection.insert_one(employee.dict())
    return {"message": "Employee created successfully", "id": str(new_employee.inserted_id)}

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