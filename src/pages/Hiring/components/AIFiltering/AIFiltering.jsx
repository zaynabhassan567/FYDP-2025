import './AIFiltering.css'

function AIFiltering({ cvs, selectedPosition, onBack, onViewCV }) {
  const handleAIFilter = () => {
    alert('AI Filtering functionality will be implemented here. This will analyze CVs and match them with job descriptions.')
  }

  return (
    <div className="ai-filtering">
      <div className="ai-header">
        <button className="btn-back" onClick={onBack}>← Back to List</button>
        <h3 className="ai-title">AI-Powered CV Filtering</h3>
      </div>

      <div className="ai-info-card">
        <div className="info-icon">🤖</div>
        <div className="info-content">
          <h4>How it works</h4>
          <p>
            The AI will analyze all CVs for the selected position and rank them based on how closely 
            they match the job description. CVs with higher match scores are more likely to be a good fit.
          </p>
        </div>
      </div>

      <div className="ai-controls">
        <div className="control-group">
          <label className="control-label">Selected Position:</label>
          <div className="position-display">
            {selectedPosition || 'All Positions'}
          </div>
        </div>
        <div className="control-group">
          <label className="control-label">Total CVs to Analyze:</label>
          <div className="count-display">{cvs.length}</div>
        </div>
      </div>

      <div className="ai-action-section">
        <button className="btn-ai-filter" onClick={handleAIFilter}>
          🤖 Run AI Filtering
        </button>
        <p className="ai-note">
          This will process all CVs and display them ranked by match score. 
          Higher scores indicate better alignment with the job requirements.
        </p>
      </div>

      <div className="ai-results-placeholder">
        <div className="placeholder-icon">📊</div>
        <h4>AI Filtering Results</h4>
        <p>Results will appear here after running AI filtering</p>
        <p className="placeholder-subtext">
          CVs will be ranked by match score (0-100%) based on:
        </p>
        <ul className="criteria-list">
          <li>Skills and qualifications match</li>
          <li>Experience relevance</li>
          <li>Education alignment</li>
          <li>Overall fit with job description</li>
        </ul>
      </div>
    </div>
  )
}

export default AIFiltering

