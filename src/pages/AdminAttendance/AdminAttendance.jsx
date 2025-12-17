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
        // approved_leaves is automatically calculated from leaves database (Approved status only)
        const approved = att.approved_leaves ?? 0
        const daily = att.daily_deduction ?? dailyBase
        // unapproved_absence = absent_days - approved_leaves (from leaves database)
        const unapprovedAbsence = att.unapproved_absence ?? Math.max(0, absent - approved)
        const totalDed = att.total_deduction ?? unapprovedAbsence * daily
        return {
          employee_code: key,
          full_name: e.full_name,
          salary: e.salary || 0,
          absent_days: absent,
          approved_leaves: approved, // Auto-fetched from leaves database
          daily_deduction: daily,
          unapproved_absence: unapprovedAbsence,
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
      prev.map((r) => {
        if (r.employee_code !== code) return r
        const updated = { ...r, [field]: value }
        // Recalculate unapproved_absence when absent_days changes
        // approved_leaves comes from leaves database automatically
        if (field === 'absent_days') {
          const absent = Number(updated.absent_days || 0)
          const approved = Number(updated.approved_leaves || 0)
          updated.unapproved_absence = Math.max(0, absent - approved)
        }
        return updated
      })
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
        // approved_leaves will be auto-calculated from leaves database in backend
        approved_leaves: 0, // Will be overridden by backend
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
                <th>Approved Leaves <br/>(from Leaves DB)</th>
                <th>Daily Deduction</th>
                <th>Unapproved Absence</th>
                <th>Est. Deduction</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    No employees or attendance data found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  // Use stored unapproved_absence or calculate it
                  const absent = Number(row.absent_days || 0)
                  const approved = Number(row.approved_leaves || 0)
                  // unapproved_absence = absent_days - approved_leaves (from leaves database)
                  const unapprovedAbsence = row.unapproved_absence != null 
                    ? Number(row.unapproved_absence) 
                    : Math.max(0, absent - approved)
                  const daily = Number(row.daily_deduction || 0)
                  const ded = unapprovedAbsence * daily
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
                        <strong>{approved}</strong>
                        <br/>
                        <small style={{color: '#666', fontSize: '0.85em'}}>
                          (Auto from Leaves)
                        </small>
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
                      <td><strong>{unapprovedAbsence}</strong></td>
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


