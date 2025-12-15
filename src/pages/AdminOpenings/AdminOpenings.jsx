import { useState } from 'react'
import './AdminOpenings.css'

function AdminOpenings({ openings, setOpenings }) {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    status: 'Active'
  })

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newOpening = {
      id: `OP${String(openings.length + 1).padStart(3, '0')}`,
      title: formData.title,
      department: formData.department || 'General',
      location: formData.location || 'Remote',
      type: formData.type,
      postedDate: new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      applicants: 0,
      status: formData.status
    }
    setOpenings([newOpening, ...openings])
    setFormData({
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      status: 'Active'
    })
  }

  return (
    <div className="admin-openings-page">
      <h1 className="page-title">Manage Openings</h1>

      <div className="openings-grid">
        <div className="form-card">
          <h2 className="section-heading">Add New Opening</h2>
          <form className="opening-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Job Title</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  id="department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="e.g. Technology"
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. Remote"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option>Active</option>
                  <option>Closed</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">Add Opening</button>
            </div>
          </form>
        </div>

        <div className="list-card">
          <h2 className="section-heading">Current Openings</h2>
          <div className="openings-list">
            {openings.map((opening) => (
              <div key={opening.id} className="opening-row">
                <div className="opening-info">
                  <div className="opening-title">{opening.title}</div>
                  <div className="opening-meta">
                    <span>{opening.department}</span>
                    <span className="dot">•</span>
                    <span>{opening.location}</span>
                    <span className="dot">•</span>
                    <span>{opening.type}</span>
                  </div>
                </div>
                <div className="opening-status">
                  <span className={`status-badge ${opening.status.toLowerCase()}`}>
                    {opening.status}
                  </span>
                  <div className="opening-date">Posted: {opening.postedDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOpenings
