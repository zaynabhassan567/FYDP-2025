import './ManualReview.css'

function ManualReview({ cv, onBack, onNext, onPrevious, totalCVs, currentIndex, onShortlist, onReject }) {
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
          {cv.fileName ? (
            <iframe
              src={cv.fileName}
              title="CV Preview"
              className="cv-iframe"
            />
          ) : (
            <div className="preview-placeholder">
              <div className="preview-icon">📄</div>
              <p className="preview-text">No CV file available</p>
              <p className="preview-note">The applicant did not upload a CV file.</p>
            </div>
          )}
        </div>

        <div className="cv-actions">
          {cv.fileName && (
            <button
              className="btn-download"
              type="button"
              onClick={() => window.open(cv.fileName, '_blank')}
            >
              ⬇️ View / Download CV
            </button>
          )}
          <button className="btn-shortlist" type="button" onClick={onShortlist}>
            ✓ Shortlist
          </button>
          <button className="btn-reject" type="button" onClick={onReject}>
            ✗ Reject
          </button>
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

