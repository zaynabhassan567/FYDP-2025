import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URI")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)

# 1. Yeh hai tumhara MAIN DATABASE (Ghar)
database = client.HR_System 

# 2. Yeh hain tumhare COLLECTIONS (Kamray)
# Hum in variables ko pure project mein use karenge data save/get karne ke liye
employee_collection = database.get_collection("employees")
job_collection = database.get_collection("jobs")
application_collection = database.get_collection("applications")
leave_collection = database.get_collection("leaves")
attendance_collection = database.get_collection("attendance")