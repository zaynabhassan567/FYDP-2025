import { useState } from 'react'
import './ApplicantOpenings.css'

function ApplicantOpenings({ openings, onApply }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOpening, setSelectedOpening] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resumeLink: ''
  })

  const openApplyModal = (opening) => {
    setSelectedOpening(opening)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOpening(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      resumeLink: ''
    })
  }

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedOpening) return

    onApply({
      openingId: selectedOpening.id,
      title: selectedOpening.title,
      department: selectedOpening.department,
      status: 'Submitted',
      appliedDate: new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      applicantName: formData.name,
      email: formData.email,
      phone: formData.phone,
      resumeLink: formData.resumeLink
    })

    closeModal()
  }

  return (
    <div className="applicant-openings-page">
      <h1 className="page-title">Available Openings</h1>

      <div className="openings-section">
        <div className="section-header">
          <h2 className="section-heading">Open Positions</h2>
          <div className="openings-stats">
            <span className="stat-item">
              Total Openings: <strong>{openings.length}</strong>
            </span>
          </div>
        </div>

        <div className="openings-list">
          {openings.map((opening) => (
            <div key={opening.id} className="opening-card">
              <div className="opening-header">
                <div className="opening-title-section">
                  <h3 className="opening-title">{opening.title}</h3>
                  <div className="opening-meta">
                    <span className="opening-department">{opening.department}</span>
                    <span className="opening-separator">•</span>
                    <span className="opening-location">{opening.location}</span>
                    <span className="opening-separator">•</span>
                    <span className="opening-type">{opening.type}</span>
                  </div>
                </div>
                <div className="opening-status">
                  <span className={`status-badge ${opening.status.toLowerCase()}`}>
                    {opening.status}
                  </span>
                </div>
              </div>

              <div className="opening-details">
                <div className="detail-item">
                  <span className="detail-label">Posted:</span>
                  <span className="detail-value">{opening.postedDate}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Applicants:</span>
                  <span className="detail-value">{opening.applicants}</span>
                </div>
              </div>

              <div className="opening-actions">
                <button
                  className="apply-btn"
                  onClick={() => openApplyModal(opening)}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {openings.length === 0 && (
          <div className="no-openings">
            <p>No openings available at the moment.</p>
          </div>
        )}
      </div>

      {isModalOpen && selectedOpening && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Apply for {selectedOpening.title}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="resumeLink">Resume / CV Link</label>
                  <input
                    id="resumeLink"
                    type="url"
                    value={formData.resumeLink}
                    onChange={(e) => handleChange('resumeLink', e.target.value)}
                    placeholder="https://drive.google.com/your-cv"
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicantOpenings

