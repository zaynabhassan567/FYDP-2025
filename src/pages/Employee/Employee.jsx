import { useEffect, useState } from 'react'
import { getAllEmployees, getAllLeaves } from '../../api'
import './Employee.css'

function Employee() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attendance, setAttendance] = useState({}) // employee_code -> unpaid days

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [empRes, leavesRes] = await Promise.all([
          getAllEmployees(),
          getAllLeaves()
        ])
        const empData = empRes.data || []
        setEmployees(empData)

        const leaves = leavesRes.data || []
        const now = new Date()
        const month = now.getMonth() + 1
        const year = now.getFullYear()

        const summary = {}
        leaves.forEach((leave) => {
          if (!leave.start_date || !leave.employee_id) return
          const d = new Date(leave.start_date)
          const sameMonth = d.getMonth() + 1 === month && d.getFullYear() === year
          const unpaid = leave.status && leave.status.toLowerCase() !== 'approved'
          if (sameMonth && unpaid) {
            const key = leave.employee_id
            summary[key] = (summary[key] || 0) + 1
          }
        })
        setAttendance(summary)
      } catch (err) {
        console.error('Error fetching employees/attendance', err)
        setError('Failed to load employees')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="employee-page">
      <h1 className="page-title">Employees</h1>
      
      <div className="employee-section">
        <h2 className="section-heading">Employee Details</h2>

        {loading && <div className="employee-loading">Loading employees...</div>}
        {error && !loading && <div className="employee-error">{error}</div>}

        <div className="employee-cards">
          {!loading && !error && employees.map((emp) => (
            <div key={emp._id || emp.employee_code} className="employee-card">
              <div className="employee-card-header">
                <div>
                  <div className="employee-name">{emp.full_name}</div>
                  <div className="employee-designation">{emp.role}</div>
                </div>
                <div className="employee-id">{emp.employee_code}</div>
              </div>

              <div className="employee-info-grid">
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{emp.department || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Salary</span>
                  <span className="info-value">
                    {emp.salary != null ? `Rs ${emp.salary.toLocaleString()}` : '-'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{emp.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mobile</span>
                  <span className="info-value">{emp.mobile || '-'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date of Joining</span>
                  <span className="info-value">
                    {emp.joined_at
                      ? new Date(emp.joined_at).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : '-'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Unpaid Leaves (This Month)</span>
                  <span className="info-value">
                    {attendance[emp.employee_code] || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Employee

