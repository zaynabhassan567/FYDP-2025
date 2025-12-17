import { useEffect, useState } from 'react'
import { getApplicationsByCandidate, getAllJobs, BACKEND_URL } from '../../api'
import './ApplicantApplications.css'

function ApplicantApplications({ userInfo }) {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadApplications = async () => {
      if (!userInfo?.email) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        
        // Fetch applications and jobs in parallel
        const [appsRes, jobsRes] = await Promise.all([
          getApplicationsByCandidate(userInfo.email),
          getAllJobs()
        ])

        const appsData = appsRes.data || []
        const jobsData = jobsRes.data || []

        // Create a map of job_id -> job details
        const jobsMap = {}
        jobsData.forEach(job => {
          jobsMap[job._id] = job
        })

        // Map applications with job details
        const mappedApplications = appsData.map(app => {
          const job = jobsMap[app.job_id] || {}
          return {
            id: app._id,
            jobId: app.job_id,
            title: job.title || 'Position Not Found',
            department: job.location || 'N/A',
            status: app.status || 'Pending',
            appliedDate: app.applied_at 
              ? new Date(app.applied_at).toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })
              : 'N/A',
            applicantName: app.candidate_name || 'N/A',
            email: app.candidate_email || userInfo.email,
            cvUrl: app.cv_url ? `${BACKEND_URL}${app.cv_url}` : null,
            response: app.status === 'Shortlisted' 
              ? 'Congratulations! Your application has been shortlisted. We will contact you soon.'
              : app.status === 'Rejected'
              ? 'Thank you for your interest. Unfortunately, we are not proceeding with your application at this time.'
              : 'Pending review by HR'
          }
        })

        setApplications(mappedApplications)
        setJobs(jobsData)
      } catch (err) {
        console.error('Error loading applications', err)
        setError('Failed to load your applications. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [userInfo?.email])

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

        {loading && (
          <div className="applications-loading">Loading your applications...</div>
        )}

        {error && !loading && (
          <div className="applications-error">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="applications-list">
              {applications.map((app) => (
                <div key={app.id} className="application-card">
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
                    {app.cvUrl && (
                      <div className="detail-item">
                        <span className="detail-label">CV:</span>
                        <span className="detail-value">
                          <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="cv-link">
                            View CV
                          </a>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="application-response">
                    <div className="response-label">Response:</div>
                    <div className="response-text">{app.response}</div>
                  </div>
                </div>
              ))}
            </div>

            {applications.length === 0 && (
              <div className="no-applications">
                <p>No applications submitted yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ApplicantApplications

