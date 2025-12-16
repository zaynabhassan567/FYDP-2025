import { useEffect, useState } from 'react'
import { getAllEmployees, getAttendanceAll, upsertAttendance } from '../../api'
import './AdminAttendance.css'

function AdminAttendance() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const monthOptions = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]

  const loadData = async (m, y) => {
    try {
      setLoading(true)
      setError('')
      const [empRes, attRes] = await Promise.all([
        getAllEmployees(),
        getAttendanceAll(m, y)
      ])
      const employees = empRes.data || []
      const atts = attRes.data || []

      const attMap = {}
      atts.forEach((a) => {
        attMap[a.employee_id] = a
      })

      const merged = employees.map((e) => {
        const key = e.employee_code
        const att = attMap[key] || {}
        const dailyBase =
          e.salary && e.salary > 0 ? Number((e.salary / 22).toFixed(0)) : 0
        const absent = att.absent_days ?? 0
        const approved = att.approved_leaves ?? 0
        const paid = att.paid_leaves ?? e.paid_leaves_total ?? 0
        const daily = att.daily_deduction ?? dailyBase
        const unpaid = att.unpaid_days ?? Math.max(0, absent - approved - paid)
        const totalDed = att.total_deduction ?? unpaid * daily
        return {
          employee_code: key,
          full_name: e.full_name,
          salary: e.salary || 0,
          absent_days: absent,
          approved_leaves: approved,
          paid_leaves: paid,
          daily_deduction: daily,
          unpaid_days: unpaid,
          total_deduction: totalDed
        }
      })

      setRows(merged)
    } catch (err) {
      console.error('Error loading attendance data', err)
      setError('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(month, year)
  }, [])

  const handleChange = (code, field, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.employee_code === code ? { ...r, [field]: value } : r
      )
    )
  }

  const handleSave = async (row) => {
    setSavingId(row.employee_code)
    try {
      const payload = {
        employee_id: row.employee_code,
        month,
        year,
        absent_days: Number(row.absent_days) || 0,
        approved_leaves: Number(row.approved_leaves) || 0,
        paid_leaves: Number(row.paid_leaves) || 0,
        daily_deduction: Number(row.daily_deduction) || 0
      }
      await upsertAttendance(payload)
      await loadData(month, year)
    } catch (err) {
      console.error('Error saving attendance', err)
      setError('Failed to save attendance')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="admin-attendance-page">
      <h1 className="page-title">Attendance & Unpaid Leave Settings</h1>

      <div className="attendance-section">
        <div className="section-header">
          <h2 className="section-heading">Monthly Attendance</h2>
          <div className="filter-row">
            <div className="filter-group">
              <label>Month</label>
              <select
                value={month}
                onChange={(e) => {
                  const m = Number(e.target.value)
                  setMonth(m)
                  loadData(m, year)
                }}
              >
                {monthOptions.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => {
                  const y = Number(e.target.value)
                  setYear(y)
                  loadData(month, y)
                }}
                min="2000"
              />
            </div>
          </div>
        </div>

        {loading && <div className="leaves-info">Loading attendance...</div>}
        {error && !loading && <div className="leaves-error">{error}</div>}

        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Salary</th>
                <th>Absent Days</th>
                <th>Approved Leaves</th>
                <th>Paid Leaves</th>
                <th>Daily Deduction</th>
                <th>Unpaid Days</th>
                <th>Est. Deduction</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading ? (
                <tr>
                  <td colSpan="10" className="no-data">
                    No employees or attendance data found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const unpaid = Number(row.unpaid_days || 0)
                  const ded = Number(row.total_deduction || 0)
                  return (
                    <tr key={row.employee_code}>
                      <td>{row.employee_code}</td>
                      <td>{row.full_name}</td>
                      <td>Rs {Number(row.salary || 0).toLocaleString()}</td>
                      <td>
                        <input
                          type="number"
                          value={row.absent_days}
                          min="0"
                          onChange={(e) =>
                            handleChange(row.employee_code, 'absent_days', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.approved_leaves}
                          min="0"
                          onChange={(e) =>
                            handleChange(row.employee_code, 'approved_leaves', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.paid_leaves}
                          min="0"
                          onChange={(e) =>
                            handleChange(row.employee_code, 'paid_leaves', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={row.daily_deduction}
                          min="0"
                          onChange={(e) =>
                            handleChange(row.employee_code, 'daily_deduction', e.target.value)
                          }
                        />
                      </td>
                      <td>{unpaid}</td>
                      <td>Rs {ded.toLocaleString()}</td>
                      <td>
                        <button
                          className="primary-btn"
                          type="button"
                          onClick={() => handleSave(row)}
                          disabled={savingId === row.employee_code}
                        >
                          {savingId === row.employee_code ? 'Saving...' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminAttendance


