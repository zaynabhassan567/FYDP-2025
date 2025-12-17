import { useEffect, useState } from 'react'
import { requestLeave, getMyLeaves, getEmployeeAttendance, getEmployee, updateEmployee } from '../../api'
import './EmployeeDashboard.css'

function EmployeeDashboard({ user }) {
  // Logged-in employee data (from backend). We will fetch the full employee record to get authoritative salary.
  const [employeeRecord, setEmployeeRecord] = useState(null)
  const [employeeLoading, setEmployeeLoading] = useState(false)
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  // Employee data from database (prefer employeeRecord, fallback to user prop)
  const employeeData = {
    name: employeeRecord?.full_name || user?.name || 'Loading...',
    id: employeeRecord?.employee_code || user?.employeeCode || 'EMP001',
    email: employeeRecord?.email || user?.email || '',
    cnic: employeeRecord?.cnic || user?.cnic || 'N/A',
    mobile: employeeRecord?.mobile || user?.mobile || 'N/A',
    // Date of joining from database
    dateOfJoining: employeeRecord?.joined_at 
      ? new Date(employeeRecord.joined_at).toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })
      : 'N/A',
    // Other fields (can be added to database schema later if needed)
    department: 'N/A', // Not in current schema
    designation: employeeRecord?.role || 'Employee',
    manager: 'N/A' // Not in current schema
  }

  useEffect(() => {
    const loadEmployee = async () => {
      if (!user?.employeeCode) return
      try {
        setEmployeeLoading(true)
        const res = await getEmployee(user.employeeCode)
        const empData = res.data || null
        setEmployeeRecord(empData)
      } catch (err) {
        console.error('Error loading employee record', err)
      } finally {
        setEmployeeLoading(false)
      }
    }
    loadEmployee()
  }, [user?.employeeCode])

  const handleEdit = () => {
    setIsEditing(true)
    setEditForm({
      full_name: employeeRecord?.full_name || '',
      email: employeeRecord?.email || '',
      mobile: employeeRecord?.mobile || ''
    })
    setEditError('')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({})
    setEditError('')
  }

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!user?.employeeCode) return
    
    try {
      setSaving(true)
      setEditError('')
      
      const updateData = {
        full_name: editForm.full_name,
        email: editForm.email,
        mobile: editForm.mobile || null
      }

      await updateEmployee(user.employeeCode, updateData)
      
      // Refresh employee record
      const res = await getEmployee(user.employeeCode)
      setEmployeeRecord(res.data || null)
      
      setIsEditing(false)
      setEditForm({})
    } catch (err) {
      console.error('Error updating employee details', err)
      setEditError(err?.response?.data?.detail || 'Failed to update details')
    } finally {
      setSaving(false)
    }
  }

  // Leave request (employee side)
  const [leaveForm, setLeaveForm] = useState({
    type: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  })

  const [leaveRequests, setLeaveRequests] = useState([])
  const [leaveLoading, setLeaveLoading] = useState(false)
  const [leaveError, setLeaveError] = useState('')

  // Leave quota constants
  const SICK_PER_MONTH = 2
  const CASUAL_PER_MONTH = 2
  const ANNUAL_PER_YEAR = 10

  // Helper: does leave overlap target period?
  const leaveOverlaps = (leave, periodStart, periodEnd) => {
    if (!leave?.startDate || !leave?.endDate) return false
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    if (isNaN(start) || isNaN(end)) return false
    return end >= periodStart && start <= periodEnd
  }

  // Derived leave usage (approved leaves only)
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  const currentYearStart = new Date(now.getFullYear(), 0, 1)
  const currentYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)

  const approvedLeaves = leaveRequests.filter((l) => (l.status || '').toLowerCase() === 'approved')

  const sickUsed = approvedLeaves
    .filter((l) => l.type === 'Sick Leave' && leaveOverlaps(l, currentMonthStart, currentMonthEnd))
    .length

  const casualUsed = approvedLeaves
    .filter((l) => l.type === 'Casual Leave' && leaveOverlaps(l, currentMonthStart, currentMonthEnd))
    .length

  const annualUsed = approvedLeaves
    .filter((l) => l.type === 'Annual Leave' && leaveOverlaps(l, currentYearStart, currentYearEnd))
    .length

  const sickRemaining = Math.max(0, SICK_PER_MONTH - sickUsed)
  const casualRemaining = Math.max(0, CASUAL_PER_MONTH - casualUsed)
  const annualRemaining = Math.max(0, ANNUAL_PER_YEAR - annualUsed)

  // Load my leaves from backend
  useEffect(() => {
    const loadLeaves = async () => {
      if (!employeeData.id) return
      try {
        setLeaveLoading(true)
        setLeaveError('')
        const res = await getMyLeaves(employeeData.id)
        const data = res.data || []
        // Map backend fields to UI-friendly format
        const mapped = data.map((item) => ({
          id: item._id,
          type: item.leave_type,
          startDate: item.start_date,
          endDate: item.end_date,
          status: item.status
        }))
        setLeaveRequests(mapped)
      } catch (err) {
        console.error('Error loading leaves', err)
        setLeaveError('Failed to load your leave history')
      } finally {
        setLeaveLoading(false)
      }
    }

    loadLeaves()
  }, [employeeData.id])

  const handleLeaveChange = (field, value) => {
    setLeaveForm({ ...leaveForm, [field]: value })
  }

  const handleLeaveSubmit = async (e) => {
    e.preventDefault()
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) return

    try {
      setLeaveLoading(true)
      setLeaveError('')

      const payload = {
        employee_id: employeeData.id,
        start_date: new Date(leaveForm.startDate).toISOString(),
        end_date: new Date(leaveForm.endDate).toISOString(),
        reason: leaveForm.reason,
        leave_type: leaveForm.type
      }

      await requestLeave(payload)

      // Refresh list
      const res = await getMyLeaves(employeeData.id)
      const data = res.data || []
      const mapped = data.map((item) => ({
        id: item._id,
        type: item.leave_type,
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status
      }))
      setLeaveRequests(mapped)

      setLeaveForm({
        type: 'Casual Leave',
        startDate: '',
        endDate: '',
        reason: ''
      })
      alert('Leave request submitted')
    } catch (err) {
      console.error('Error submitting leave', err)
      setLeaveError('Failed to submit leave request')
    } finally {
      setLeaveLoading(false)
    }
  }

  // Attendance + salary derived from attendance collection if available

  const [attendanceSummary, setAttendanceSummary] = useState(null)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceError, setAttendanceError] = useState('')
  const [showAttendanceRaw, setShowAttendanceRaw] = useState(false)

  const loadAttendance = async () => {
    if (!employeeData.id) return
    try {
      setAttendanceLoading(true)
      setAttendanceError('')
      const res = await getEmployeeAttendance(employeeData.id, month, year)
      setAttendanceSummary(res.data || null)
    } catch (err) {
      console.error('Error loading attendance summary', err)
      setAttendanceError('Failed to load attendance summary')
      setAttendanceSummary(null)
    } finally {
      setAttendanceLoading(false)
    }
  }

  useEffect(() => {
    loadAttendance()
  }, [employeeData.id, month, year])

  // Get monthly salary from database (salary is stored as monthly in database)
  // Prefer employeeRecord from database, fallback to user prop only if employeeRecord not loaded yet
  const monthlySalary = employeeRecord?.salary 
    ? Number(employeeRecord.salary) 
    : (employeeLoading ? 0 : (user?.salary ? Number(user.salary) : 0))

  // Attendance-derived values (prefer attendance collection when available)
  const absentDaysFromAttendance = attendanceSummary?.absent_days ?? null
  // approved_leaves is automatically calculated from leaves database (Approved status only)
  const approvedLeavesFromAttendance = attendanceSummary?.approved_leaves ?? 0
  
  // unapproved_absence = absent_days - approved_leaves (from leaves database)
  const unapprovedAbsenceFromAttendance = attendanceSummary?.unapproved_absence ?? null
  
  // Prefer attendance-provided daily deduction, but validate it — fall back to (monthly/22) if unrealistic
  const attendanceDailyRaw = attendanceSummary?.daily_deduction
  const fallbackDaily = monthlySalary > 0 ? monthlySalary / 22 : 0
  const dailySalaryFromAttendance = (() => {
    if (typeof attendanceDailyRaw === 'number' && attendanceDailyRaw > 0) {
      // If attendance-provided daily deduction is more than monthly salary, it's likely incorrect.
      if (attendanceDailyRaw < monthlySalary * 1.2) {
        return attendanceDailyRaw
      }
      // otherwise fall back
      return fallbackDaily
    }
    return fallbackDaily
  })()
  const usedAttendanceDaily = typeof attendanceDailyRaw === 'number' && attendanceDailyRaw > 0 && attendanceDailyRaw < monthlySalary * 1.2

  // Compute unapproved_absence if not available from DB: absent_days - approved_leaves (from leaves database)
  const unapprovedAbsenceComputed =
    absentDaysFromAttendance != null
      ? Math.max(0, absentDaysFromAttendance - approvedLeavesFromAttendance)
      : null

  // final unapproved absence to use (prefer DB's unapproved_absence, else computed, else fallback to leaveRequests count)
  const unapprovedAbsence = unapprovedAbsenceFromAttendance != null 
    ? unapprovedAbsenceFromAttendance 
    : unapprovedAbsenceComputed != null 
      ? unapprovedAbsenceComputed 
      : leaveRequests.filter((day) => (day.status || '').toLowerCase() !== 'approved').length

  // Prefer server-provided total_deduction if available (based on unapproved_absence)
  const totalDeduction =
    typeof attendanceSummary?.total_deduction === 'number' && attendanceSummary.total_deduction >= 0
      ? attendanceSummary.total_deduction
      : unapprovedAbsence * dailySalaryFromAttendance
  const finalSalary = monthlySalary - totalDeduction

  return (
    <div className="employee-dashboard-page">
      <h1 className="page-title">Hello {employeeData.name}</h1>
      
      <div className="dashboard-section">
        {/* Employee Details Section */}
        <div className="employee-details-section">
          <div className="section-header-row">
            <h2 className="section-heading">Employee Details</h2>
            {!isEditing ? (
              <button className="btn-edit-profile" onClick={handleEdit}>
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-save-profile" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="btn-cancel-profile" onClick={handleCancelEdit} disabled={saving}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          {editError && (
            <div className="edit-error">
              <div className="error-message">{editError}</div>
              {(editError.includes('CNIC') || editError.includes('Email') || editError.includes('already')) && (
                <button
                  type="button"
                  className="try-again-button"
                  onClick={() => setEditError('')}
                >
                  Try Again
                </button>
              )}
            </div>
          )}

          <div className="employee-details-grid">
            <div className="detail-card">
              <div className="detail-row">
                <span className="detail-label">Employee ID:</span>
                <span className="detail-value">{employeeData.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => handleFormChange('full_name', e.target.value)}
                    className="edit-input-dashboard"
                    placeholder="Full Name"
                  />
                ) : (
                  <span className="detail-value">{employeeData.name}</span>
                )}
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className="edit-input-dashboard"
                    placeholder="Email"
                  />
                ) : (
                  <span className="detail-value">{employeeData.email}</span>
                )}
              </div>
              <div className="detail-row">
                <span className="detail-label">CNIC Number:</span>
                <span className="detail-value">{employeeData.cnic}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mobile:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.mobile}
                    onChange={(e) => handleFormChange('mobile', e.target.value)}
                    className="edit-input-dashboard"
                    placeholder="+92 300 1234567"
                  />
                ) : (
                  <span className="detail-value">{employeeData.mobile}</span>
                )}
              </div>
            </div>
            <div className="detail-card">
              <div className="detail-row">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{employeeData.department}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Designation:</span>
                <span className="detail-value">{employeeData.designation}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date of Joining:</span>
                <span className="detail-value">{employeeData.dateOfJoining}</span>
              </div>
            </div>
            <div className="detail-card">
              <div className="detail-row">
                <span className="detail-label">Manager:</span>
                <span className="detail-value">{employeeData.manager}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Monthly Salary:</span>
                <span className="detail-value">
                  {employeeLoading ? (
                    'Loading...'
                  ) : monthlySalary > 0 ? (
                    `Rs ${monthlySalary.toLocaleString()}`
                  ) : (
                    'Not set'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Section */}
        <div className="attendance-section">
          <h2 className="section-heading">Attendance Record</h2>
          <div className="attendance-actions">
            <button className="secondary-btn" type="button" onClick={loadAttendance} disabled={attendanceLoading}>
              {attendanceLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              className="secondary-btn"
              type="button"
              onClick={() => setShowAttendanceRaw((s) => !s)}
              style={{ marginLeft: 8 }}
            >
              {showAttendanceRaw ? 'Hide' : 'Show'} raw
            </button>
            {attendanceError && <div className="attendance-error">{attendanceError}</div>}
          </div>
          <div className="attendance-summary">
            <div className="summary-card">
              <div className="summary-icon">📅</div>
              <div className="summary-content">
                  <div className="summary-value">{absentDaysFromAttendance ?? (leaveRequests.length)}</div>
                  <div className="summary-label">Total Absent Days</div>
              </div>
            </div>
            <div className="summary-card warning">
              <div className="summary-icon">⚠️</div>
              <div className="summary-content">
                <div className="summary-value">{unapprovedAbsence}</div>
                <div className="summary-label">Unapproved Absences</div>
              </div>
            </div>
              <div className="summary-card info">
                <div className="summary-icon">💵</div>
                <div className="summary-content">
                  <div className="summary-value">{dailySalaryFromAttendance.toFixed(2)}</div>
                  <div className="summary-label">Daily Deduction</div>
                </div>
              </div>
              {/* Removed the separate Est. Deduction card — deduction now shown in Salary Calculation below */}
          </div>
          
          <div className="attendance-list-card">
            <h3 className="card-title">Absent Days This Month</h3>
            <div className="attendance-list">
              {leaveRequests.length > 0 ? (
                leaveRequests.map((day) => (
                  <div key={day.id} className={`attendance-item ${(day.status || 'unknown').toLowerCase()}`}>
                    <div className="attendance-date">
                      <div className="date-day">
                        {new Date(day.startDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}{' '}
                        -{' '}
                        {new Date(day.endDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className={`status-badge ${(day.status || 'unknown').toLowerCase()}`}>
                        {day.status || 'Unknown'}
                      </div>
                    </div>
                    <div className="attendance-reason">{day.type}</div>
                  </div>
                ))
              ) : (
                <div className="no-absence">No absences recorded this month</div>
              )}
            </div>
          </div>
        </div>

        {/* Salary Calculation Section */}
        <div className="salary-and-leave">
          <div className="salary-section">
            <h2 className="section-heading">Salary Calculation</h2>
            <div className="salary-source-note">
              {attendanceLoading ? (
                <em>Refreshing attendance data...</em>
              ) : attendanceSummary ? (
                <em>Calculation based on attendance records for {month}/{year}.</em>
              ) : (
                <em>No attendance summary available; calculations fallback to leave requests.</em>
              )}
            </div>
            <div className="salary-calculation-card">
              <div className="salary-breakdown">
                <div className="salary-row">
                  <span className="salary-label">Monthly Base Salary:</span>
                  <span className="salary-amount">
                    {employeeLoading ? (
                      'Loading...'
                    ) : monthlySalary > 0 ? (
                      `Rs ${monthlySalary.toFixed(2)}`
                    ) : (
                      'Not set'
                    )}
                  </span>
                </div>
                <div className="salary-row deduction">
                  <span className="salary-label">Deductions (Unapproved Absences):</span>
                  <span className="salary-amount">-Rs {totalDeduction.toFixed(2)}</span>
                </div>
                <div className="salary-row deduction-details">
                  <span className="salary-label-small">
                    ({unapprovedAbsence} unapproved day{unapprovedAbsence !== 1 ? 's' : ''} × Rs {dailySalaryFromAttendance.toFixed(2)}/day)
                    {!usedAttendanceDaily && attendanceSummary != null && (
                      <span> — attendance value ignored; using Rs {fallbackDaily.toFixed(2)}/day</span>
                    )}
                    {attendanceSummary == null && (
                      <span> — fallback used (no attendance record)</span>
                    )}
                  </span>
                </div>
                {attendanceSummary && (
                  <div className="salary-row small-note">
                    <em>Attendance report: {attendanceSummary.absent_days ?? 0} absent, {attendanceSummary.approved_leaves ?? 0} approved leaves (from Leaves DB), {attendanceSummary.unapproved_absence ?? 0} unapproved absence.</em>
                  </div>
                )}
                {showAttendanceRaw && (
                  <div className="salary-row raw-json" style={{ marginTop: 8 }}>
                    <pre style={{ maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(attendanceSummary, null, 2)}</pre>
                  </div>
                )}
                <div className="salary-divider"></div>
                <div className="salary-row final">
                  <span className="salary-label">Final Salary (This Month):</span>
                  <span className="salary-amount final-amount">
                    {employeeLoading ? (
                      'Loading...'
                    ) : monthlySalary > 0 ? (
                      `Rs ${finalSalary.toFixed(2)}`
                    ) : (
                      'Not set'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="leave-section">
            <h2 className="section-heading">Leave Request Form</h2>

            <div className="leave-quota-grid">
              <div className="leave-quota-card sick">
                <div className="quota-header">
                  <span className="quota-title">Sick Leave</span>
                  <span className="quota-allowance">2 per month</span>
                </div>
                <div className="quota-values">
                  <span className="quota-used">{sickUsed} used</span>
                  <span className="quota-remaining">{sickRemaining} left</span>
                </div>
              </div>

              <div className="leave-quota-card casual">
                <div className="quota-header">
                  <span className="quota-title">Casual Leave</span>
                  <span className="quota-allowance">2 per month</span>
                </div>
                <div className="quota-values">
                  <span className="quota-used">{casualUsed} used</span>
                  <span className="quota-remaining">{casualRemaining} left</span>
                </div>
              </div>

              <div className="leave-quota-card annual">
                <div className="quota-header">
                  <span className="quota-title">Annual Leave</span>
                  <span className="quota-allowance">10 per year</span>
                </div>
                <div className="quota-values">
                  <span className="quota-used">{annualUsed} used</span>
                  <span className="quota-remaining">{annualRemaining} left</span>
                </div>
              </div>
            </div>

            <form className="leave-form" onSubmit={handleLeaveSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Leave Type</label>
                  <select
                    value={leaveForm.type}
                    onChange={(e) => handleLeaveChange('type', e.target.value)}
                  >
                    <option>Casual Leave</option>
                    <option>Sick Leave</option>
                    <option>Annual Leave</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => handleLeaveChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => handleLeaveChange('endDate', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <textarea
                  rows="3"
                  value={leaveForm.reason}
                  onChange={(e) => handleLeaveChange('reason', e.target.value)}
                  placeholder="Enter reason for leave"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  {leaveLoading ? 'Please wait...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>

            <div className="leave-history">
              <h3 className="leave-history-title">Recent Leave Requests</h3>
              {leaveError && <div className="leave-error-text">{leaveError}</div>}
              <div className="leave-history-list">
                {leaveLoading && leaveRequests.length === 0 && (
                  <div className="leave-item-dates">Loading your leaves...</div>
                )}
                {!leaveLoading &&
                  leaveRequests.map((req) => (
                    <div key={req.id} className={`leave-item ${(req.status || 'unknown').toLowerCase()}`}>
                      <div className="leave-item-header">
                        <span className="leave-type">{req.type}</span>
                        <span className={`leave-status-badge ${(req.status || 'unknown').toLowerCase()}`}>
                          {req.status || 'Unknown'}
                        </span>
                      </div>
                      <div className="leave-item-dates">
                        {new Date(req.startDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}{' '}
                        -{' '}
                        {new Date(req.endDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  ))}
                {!leaveLoading && leaveRequests.length === 0 && !leaveError && (
                  <div className="leave-item-dates">No leave requests yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard

