from fastapi import APIRouter, Body, HTTPException
from bson import ObjectId
from app.models import LeaveModel
from app.database import leave_collection

# --- YEH LINE MISSING HOGI ---
router = APIRouter()

# 1. REQUEST LEAVE
@router.post("/request")
async def request_leave(leave: LeaveModel = Body(...)):
    new_leave = await leave_collection.insert_one(leave.dict())
    return {"message": "Leave Requested", "id": str(new_leave.inserted_id)}

# 2. GET MY LEAVES
@router.get("/employee/{employee_id}")
async def get_my_leaves(employee_id: str):
    leaves = []
    async for leave in leave_collection.find({"employee_id": employee_id}):
        leave["_id"] = str(leave["_id"])
        leaves.append(leave)
    return leaves

# 3. GET ALL LEAVES
@router.get("/all")
async def get_all_leaves():
    leaves = []
    async for leave in leave_collection.find():
        leave["_id"] = str(leave["_id"])
        leaves.append(leave)
    return leaves


# 4. UPDATE LEAVE STATUS (Admin approve/reject)
@router.patch("/status/{leave_id}")
async def update_leave_status(leave_id: str, payload: dict = Body(...)):
    status = payload.get("status")
    if status not in {"Pending", "Approved", "Rejected", "Unapproved"}:
        raise HTTPException(status_code=400, detail="Invalid status value")

    update_data = {"status": status}
    admin_comment = payload.get("admin_comments")
    if admin_comment is not None:
      update_data["admin_comments"] = admin_comment

    try:
        obj_id = ObjectId(leave_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid leave id")

    result = await leave_collection.update_one(
        {"_id": obj_id},
        {"$set": update_data},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Leave not found")

    return {"message": "Status updated", "status": status}