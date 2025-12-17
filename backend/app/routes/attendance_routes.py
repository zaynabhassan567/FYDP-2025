from fastapi import APIRouter, Body, HTTPException
from bson import ObjectId
from datetime import datetime
from app.models import AttendanceModel
from app.database import attendance_collection, leave_collection

router = APIRouter()


@router.get("/all")
async def get_all_attendance(month: int, year: int):
  """Get attendance summary for all employees for a month/year."""
  docs = []
  
  # First, get all approved leaves for this month/year
  approved_leaves_map = {}  # employee_id -> count
  async for leave in leave_collection.find({"status": "Approved"}):
    if leave.get("start_date") and leave.get("employee_id"):
      leave_date = leave["start_date"]
      # Handle both datetime objects and strings
      if isinstance(leave_date, str):
        try:
          leave_date = datetime.fromisoformat(leave_date.replace("Z", "+00:00"))
        except:
          continue
      elif not isinstance(leave_date, datetime):
        continue
      if leave_date.month == month and leave_date.year == year:
        emp_id = leave["employee_id"]
        approved_leaves_map[emp_id] = approved_leaves_map.get(emp_id, 0) + 1
  
  # Now get attendance records and update approved_leaves from leaves database
  async for att in attendance_collection.find({"month": month, "year": year}):
    emp_id = att.get("employee_id")
    approved_count = approved_leaves_map.get(emp_id, 0)
    att["approved_leaves"] = approved_count
    
    # Recalculate unapproved_absence = absent_days - approved_leaves
    absent = att.get("absent_days", 0) or 0
    att["unapproved_absence"] = max(0, absent - approved_count)
    
    att["_id"] = str(att["_id"])
    docs.append(att)
  return docs


@router.get("/employee/{employee_id}")
async def get_employee_attendance(employee_id: str, month: int, year: int):
  """Get single employee's attendance for a given month/year."""
  att = await attendance_collection.find_one(
    {"employee_id": employee_id, "month": month, "year": year}
  )
  if not att:
    return None
  
  # Fetch approved leaves count from leaves database for this month/year
  approved_count = 0
  async for leave in leave_collection.find({
    "employee_id": employee_id,
    "status": "Approved"
  }):
    if leave.get("start_date"):
      leave_date = leave["start_date"]
      # Handle both datetime objects and strings
      if isinstance(leave_date, str):
        try:
          leave_date = datetime.fromisoformat(leave_date.replace("Z", "+00:00"))
        except:
          continue
      elif not isinstance(leave_date, datetime):
        continue
      if leave_date.month == month and leave_date.year == year:
        approved_count += 1
  
  # Update approved_leaves from leaves database
  att["approved_leaves"] = approved_count
  # Recalculate unapproved_absence = absent_days - approved_leaves
  absent = att.get("absent_days", 0) or 0
  att["unapproved_absence"] = max(0, absent - approved_count)
  att["_id"] = str(att["_id"])
  return att


@router.post("/upsert")
async def upsert_attendance(att: AttendanceModel = Body(...)):
  """Create or update monthly attendance for an employee."""
  data = att.dict()
  
  # Fetch approved leaves count from leaves database for this month/year
  approved_count = 0
  async for leave in leave_collection.find({
    "employee_id": att.employee_id,
    "status": "Approved"
  }):
    if leave.get("start_date"):
      leave_date = leave["start_date"]
      # Handle both datetime objects and strings
      if isinstance(leave_date, str):
        try:
          leave_date = datetime.fromisoformat(leave_date.replace("Z", "+00:00"))
        except:
          continue
      elif not isinstance(leave_date, datetime):
        continue
      if leave_date.month == att.month and leave_date.year == att.year:
        approved_count += 1
  
  # Override approved_leaves with count from leaves database
  data['approved_leaves'] = approved_count
  
  # derived fields: unapproved_absence and total_deduction
  absent = data.get('absent_days', 0) or 0
  daily = data.get('daily_deduction', 0) or 0
  
  # unapproved_absence = absent_days - approved_leaves (from leaves database)
  unapproved_absence = max(0, absent - approved_count)
  data['unapproved_absence'] = unapproved_absence
  
  # total_deduction based on unapproved_absence
  data['total_deduction'] = unapproved_absence * daily
  
  # Keep unpaid_days for backward compatibility
  paid = data.get('paid_leaves', 0) or 0
  unpaid = max(0, absent - approved_count - paid)
  data['unpaid_days'] = unpaid
  existing = await attendance_collection.find_one(
    {"employee_id": att.employee_id, "month": att.month, "year": att.year}
  )
  if existing:
    await attendance_collection.update_one(
      {"_id": existing["_id"]},
      {"$set": data},
    )
    return {"message": "Attendance updated"}
  else:
    new_doc = await attendance_collection.insert_one(data)
    return {"message": "Attendance created", "id": str(new_doc.inserted_id)}


