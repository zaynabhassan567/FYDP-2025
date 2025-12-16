from fastapi import APIRouter, Body, HTTPException
from bson import ObjectId
from app.models import AttendanceModel
from app.database import attendance_collection

router = APIRouter()


@router.get("/all")
async def get_all_attendance(month: int, year: int):
  """Get attendance summary for all employees for a month/year."""
  docs = []
  async for att in attendance_collection.find({"month": month, "year": year}):
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
  att["_id"] = str(att["_id"])
  return att


@router.post("/upsert")
async def upsert_attendance(att: AttendanceModel = Body(...)):
  """Create or update monthly attendance for an employee."""
  data = att.dict()
  # derived fields: unpaid_days and total_deduction
  absent = data.get('absent_days', 0) or 0
  approved = data.get('approved_leaves', 0) or 0
  paid = data.get('paid_leaves', 0) or 0
  daily = data.get('daily_deduction', 0) or 0
  unpaid = max(0, absent - approved - paid)
  data['unpaid_days'] = unpaid
  data['total_deduction'] = unpaid * daily
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


