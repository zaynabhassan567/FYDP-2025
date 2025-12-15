import { useState } from 'react'
import './EmployeeDashboard.css'

function EmployeeDashboard() {
  // Sample employee data
  const employeeData = {
    name: 'John Doe',
    id: 'EMP001',
    email: 'john.doe@company.com',
    phone: '+1 234 567 8900',
    department: 'Technology',
    designation: 'Software Engineer',
    dateOfJoining: '1 March, 2023',
    manager: 'Jane Smith',
    baseSalary: 75000 // Annual base salary
  }

  // Dummy attendance data - days employee didn't come to office
  const absentDays = [
    { date: '5 Nov, 2024', reason: 'Sick Leave', status: 'Approved' },
    { date: '8 Nov, 2024', reason: 'Personal Leave', status: 'Approved' },
    { date: '12 Nov, 2024', reason: 'Sick Leave', status: 'Approved' },
    { date: '15 Nov, 2024', reason: 'Unapproved Absence', status: 'Unapproved' }
  ]

  // Calculate salary deductions
  const totalAbsentDays = absentDays.length
  const unapprovedAbsences = absentDays.filter(day => day.status === 'Unapproved').length
  const workingDaysPerMonth = 22 // Average working days per month
  const dailySalary = (employeeData.baseSalary / 12) / workingDaysPerMonth
  const deductionPerUnapprovedDay = dailySalary // Full day deduction for unapproved absences
  const totalDeduction = unapprovedAbsences * deductionPerUnapprovedDay
  const monthlySalary = (employeeData.baseSalary / 12)
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
          <div className="attendance-summary">
            <div className="summary-card">
              <div className="summary-icon">📅</div>
              <div className="summary-content">
                <div className="summary-value">{totalAbsentDays}</div>
                <div className="summary-label">Total Absent Days</div>
              </div>
            </div>
            <div className="summary-card warning">
              <div className="summary-icon">⚠️</div>
              <div className="summary-content">
                <div className="summary-value">{unapprovedAbsences}</div>
                <div className="summary-label">Unapproved Absences</div>
              </div>
            </div>
          </div>
          
          <div className="attendance-list-card">
            <h3 className="card-title">Absent Days This Month</h3>
            <div className="attendance-list">
              {absentDays.length > 0 ? (
                absentDays.map((day, index) => (
                  <div key={index} className={`attendance-item ${day.status.toLowerCase()}`}>
                    <div className="attendance-date">
                      <div className="date-day">{day.date}</div>
                      <div className={`status-badge ${day.status.toLowerCase()}`}>
                        {day.status}
                      </div>
                    </div>
                    <div className="attendance-reason">{day.reason}</div>
                  </div>
                ))
              ) : (
                <div className="no-absence">No absences recorded this month</div>
              )}
            </div>
          </div>
        </div>

        {/* Salary Calculation Section */}
        <div className="salary-section">
          <h2 className="section-heading">Salary Calculation</h2>
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
                  ({unapprovedAbsences} unapproved day{unapprovedAbsences !== 1 ? 's' : ''} × ${dailySalary.toFixed(2)}/day)
                </span>
              </div>
              <div className="salary-divider"></div>
              <div className="salary-row final">
                <span className="salary-label">Final Salary (This Month):</span>
                <span className="salary-amount final-amount">${finalSalary.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard

