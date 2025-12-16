import { useEffect, useState } from 'react'
import { requestLeave, getMyLeaves, getEmployeeAttendance, getEmployee } from '../../api'
import './EmployeeDashboard.css'

function EmployeeDashboard({ user }) {
  // Logged-in employee data (from backend). We will fetch the full employee record to get authoritative salary.
  const [employeeRecord, setEmployeeRecord] = useState(null)
  const [employeeLoading, setEmployeeLoading] = useState(false)
  const employeeData = {
    name: user?.name || 'John Doe',
    id: user?.employeeCode || 'EMP001',
    email: user?.email || 'john.doe@company.com',
    phone: '+1 234 567 8900',
    department: 'Technology',
    designation: 'Software Engineer',
    dateOfJoining: '1 March, 2023',
    manager: 'Jane Smith',
    // prefer employeeRecord.salary from DB, then user prop, then default
    baseSalary: (employeeRecord && Number(employeeRecord.salary)) || Number(user?.salary) || 75000 // Annual
  }

  useEffect(() => {
    const loadEmployee = async () => {
      if (!user?.employeeCode) return
      try {
        setEmployeeLoading(true)
        const res = await getEmployee(user.employeeCode)
        setEmployeeRecord(res.data || null)
      } catch (err) {
        console.error('Error loading employee record', err)
      } finally {
        setEmployeeLoading(false)
      }
    }
    loadEmployee()
  }, [user?.employeeCode])

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
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

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

  const baseSalary = Number(employeeData.baseSalary) || 0
  const monthlySalary = baseSalary / 12

  // Attendance-derived values (prefer attendance collection when available)
  // Prefer precomputed unpaid_days from attendance summary when possible
  const absentDaysFromAttendance = attendanceSummary?.absent_days ?? null
  const unpaidFromAttendance =
    attendanceSummary?.unpaid_days != null
      ? Math.max(0, attendanceSummary.unpaid_days)
      : null
  const approvedLeavesFromAttendance = attendanceSummary?.approved_leaves ?? 0
  const paidLeavesConfigured = attendanceSummary?.paid_leaves ?? 0
  // Prefer attendance-provided daily deduction, but validate it — fall back to (monthly/22) if unrealistic
  const attendanceDailyRaw = attendanceSummary?.daily_deduction
  const fallbackDaily = baseSalary > 0 ? (baseSalary / 12) / 22 : 0
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

  const unpaidFromAttendanceComputed =
    absentDaysFromAttendance != null
      ? Math.max(0, absentDaysFromAttendance - approvedLeavesFromAttendance - paidLeavesConfigured)
      : null

  // final unpaid days to use (prefer DB's unpaid_days, else computed, else fallback to leaveRequests count)
  const unpaid = unpaidFromAttendance != null ? unpaidFromAttendance : unpaidFromAttendanceComputed != null ? unpaidFromAttendanceComputed : leaveRequests.filter((day) => (day.status || '').toLowerCase() !== 'approved').length

  // Prefer server-provided total_deduction if available
  const totalDeduction =
    typeof attendanceSummary?.total_deduction === 'number' && attendanceSummary.total_deduction >= 0
      ? attendanceSummary.total_deduction
      : unpaid * dailySalaryFromAttendance
  const finalSalary = monthlySalary - totalDeduction

  return (
    <div className="employee-dashboard-page">
      <h1 className="page-title">Hello {employeeData.name}</h1>
      
      <div className="dashboard-section">
        {/* Employee Details Section */}
        <div className="employee-details-section">
          <h2 className="section-heading">Employee Details</h2>
          <div className="employee-details-grid">
            <div className="detail-card">
              <div className="detail-row">
                <span className="detail-label">Employee ID:</span>
                <span className="detail-value">{employeeData.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{employeeData.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{employeeData.phone}</span>
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
                <span className="detail-label">Base Salary (Annual):</span>
                <span className="detail-value">${employeeData.baseSalary.toLocaleString()}</span>
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
                <div className="summary-value">{unpaid}</div>
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
                  <span className="salary-amount">${monthlySalary.toFixed(2)}</span>
                </div>
                <div className="salary-row deduction">
                  <span className="salary-label">Deductions (Unapproved Absences):</span>
                  <span className="salary-amount">-${totalDeduction.toFixed(2)}</span>
                </div>
                <div className="salary-row deduction-details">
                  <span className="salary-label-small">
                    ({unpaid} unapproved day{unpaid !== 1 ? 's' : ''} × ${dailySalaryFromAttendance.toFixed(2)}/day)
                    {!usedAttendanceDaily && attendanceSummary != null && (
                      <span> — attendance value ignored; using ${fallbackDaily.toFixed(2)}/day</span>
                    )}
                    {attendanceSummary == null && (
                      <span> — fallback used (no attendance record)</span>
                    )}
                  </span>
                </div>
                {attendanceSummary && (
                  <div className="salary-row small-note">
                    <em>Attendance report: {attendanceSummary.absent_days ?? 0} absent, {attendanceSummary.approved_leaves ?? 0} approved, {attendanceSummary.paid_leaves ?? 0} paid.</em>
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
                  <span className="salary-amount final-amount">${finalSalary.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="leave-section">
            <h2 className="section-heading">Leave Request Form</h2>

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
                    <option>Unpaid Leave</option>
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

