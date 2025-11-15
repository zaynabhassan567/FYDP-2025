import './ManualReview.css'

function ManualReview({ cv, onBack, onNext, onPrevious, totalCVs, currentIndex }) {
  if (!cv) {
    return (
      <div className="manual-review">
        <button className="btn-back" onClick={onBack}>← Back to List</button>
        <div className="no-cv-selected">No CV selected</div>
      </div>
    )
  }

  return (
    <div className="manual-review">
      <div className="review-header">
        <button className="btn-back" onClick={onBack}>← Back to List</button>
        <div className="cv-counter">
          CV {currentIndex} of {totalCVs}
        </div>
      </div>

      <div className="cv-details-card">
        <div className="cv-header">
          <div>
            <h2 className="applicant-name">{cv.applicantName}</h2>
            <p className="applicant-email">{cv.email}</p>
          </div>
          <div className="cv-meta">
            <span className="meta-item">
              <strong>Position:</strong> {cv.position}
            </span>
            <span className="meta-item">
              <strong>Uploaded:</strong> {cv.uploadedDate}
            </span>
          </div>
        </div>

        <div className="cv-preview">
          <div className="preview-placeholder">
            <div className="preview-icon">📄</div>
            <p className="preview-text">CV Preview: {cv.fileName}</p>
            <p className="preview-note">CV viewer will be implemented here</p>
          </div>
        </div>

        <div className="cv-actions">
          <button className="btn-download">⬇️ Download CV</button>
          <button className="btn-shortlist">✓ Shortlist</button>
          <button className="btn-reject">✗ Reject</button>
        </div>
      </div>

      <div className="navigation-buttons">
        <button 
          className="btn-nav btn-prev"
          onClick={onPrevious}
          disabled={currentIndex === 1}
        >
          ← Previous
        </button>
        <button 
          className="btn-nav btn-next"
          onClick={onNext}
          disabled={currentIndex === totalCVs}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default ManualReview

