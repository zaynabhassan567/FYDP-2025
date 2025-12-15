import './ApplicantApplications.css'

function ApplicantApplications({ applications }) {
  return (
    <div className="applicant-applications-page">
      <h1 className="page-title">My Applications</h1>

      <div className="applications-section">
        <div className="section-header">
          <h2 className="section-heading">Submitted Applications</h2>
          <div className="openings-stats">
            <span className="stat-item">
              Total: <strong>{applications.length}</strong>
            </span>
          </div>
        </div>

        <div className="applications-list">
          {applications.map((app, index) => (
            <div key={index} className="application-card">
              <div className="application-header">
                <div className="application-title-section">
                  <h3 className="application-title">{app.title}</h3>
                  <div className="application-meta">
                    <span className="application-department">{app.department}</span>
                    <span className="application-separator">•</span>
                    <span className="application-date">Applied: {app.appliedDate}</span>
                  </div>
                </div>
                <div className="application-status">
                  <span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span>
                </div>
              </div>

              <div className="application-details">
                <div className="detail-item">
                  <span className="detail-label">Applicant:</span>
                  <span className="detail-value">{app.applicantName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{app.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{app.phone}</span>
                </div>
              </div>

              <div className="application-response">
                <div className="response-label">Response:</div>
                <div className="response-text">{app.response || 'Pending review by HR'}</div>
              </div>
            </div>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="no-applications">
            <p>No applications submitted yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicantApplications

