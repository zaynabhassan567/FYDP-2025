import axios from 'axios';

// 1. Base URL set karo (Tumhara Backend)
export const BACKEND_URL = 'http://127.0.0.1:8000';
const API = axios.create({ baseURL: `${BACKEND_URL}/api` });

// 2. TOKEN AUTOMATION (Ye Jadoo hai)
// Har request se pehle yeh check karega ke localStorage mein token hai ya nahi.
// Agar hai, to khud ba khud header mein laga dega.
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// --- SAARI APIS EK JAGAH ---

// A. AUTHENTICATION
export const signup = (data) => API.post('/employee/signup', data);
export const login = (data) => API.post('/employee/login', data);
export const getAllEmployees = () => API.get('/employee/all');
export const getEmployee = (employeeCode) => API.get(`/employee/${employeeCode}`);

// B. JOBS (HR Jobs post karega, Candidates dekhenge)
export const createJob = (jobData) => API.post('/jobs/create', jobData);
export const getAllJobs = () => API.get('/jobs/all');

// C. LEAVES (Employee request karega, HR dekhega)
export const requestLeave = (leaveData) => API.post('/leaves/request', leaveData);
export const getMyLeaves = (employeeId) => API.get(`/leaves/employee/${employeeId}`);
export const getAllLeaves = () => API.get('/leaves/all');
export const updateLeaveStatus = (leaveId, status, admin_comments) =>
  API.patch(`/leaves/status/${leaveId}`, { status, admin_comments });

// E. ATTENDANCE (monthly summary)
export const getAttendanceAll = (month, year) =>
  API.get('/attendance/all', { params: { month, year } });
export const getEmployeeAttendance = (employeeId, month, year) =>
  API.get(`/attendance/employee/${employeeId}`, { params: { month, year } });
export const upsertAttendance = (data) => API.post('/attendance/upsert', data);

// D. APPLICATIONS (CV Upload karna)
export const applyForJob = (applicationData) => API.post('/applications/apply-file', applicationData);
export const getApplicationsForJob = (jobId) => API.get(`/applications/${jobId}`);
export const updateApplicationStatus = (applicationId, status) =>
  API.patch(`/applications/${applicationId}/status`, { status });

export default API;