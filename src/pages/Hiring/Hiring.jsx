import { useEffect, useState } from 'react'
import { getAllJobs, getApplicationsForJob, BACKEND_URL, updateApplicationStatus } from '../../api'
import CVList from './components/CVList/CVList'
import PositionFilter from './components/PositionFilter/PositionFilter'
import ManualReview from './components/ManualReview/ManualReview'
import AIFiltering from './components/AIFiltering/AIFiltering'
import './Hiring.css'

function Hiring() {
  const [selectedPosition, setSelectedPosition] = useState('All Positions')
  const [selectedCV, setSelectedCV] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list', 'manual', 'ai'
  const [cvs, setCVs] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const positions = ['All Positions', ...jobs.map((j) => j.title)]

  const filteredCVs =
    selectedPosition && selectedPosition !== 'All Positions'
      ? cvs.filter((cv) => cv.position === selectedPosition)
      : cvs

  const unviewedCount = cvs.filter(cv => cv.status === 'Unviewed').length

  useEffect(() => {
    const loadApplicationsForJob = async (jobId, jobTitle) => {
      if (!jobId) {
        setCVs([])
        return
      }
      try {
        const appsRes = await getApplicationsForJob(jobId)
        const apps = appsRes.data || []
        const mapped = apps.map((app, index) => ({
          id: app._id || `CV${index + 1}`,
          applicantName: app.candidate_name,
          email: app.candidate_email,
          position: jobTitle,
          uploadedDate: app.applied_at
            ? new Date(app.applied_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
            : '-',
          status: app.status || 'Unviewed',
          fileName: app.cv_url
            ? app.cv_url.startsWith('http')
              ? app.cv_url
              : `${BACKEND_URL}${app.cv_url}`
            : '',
          matchScore: app.ai_score ?? null
        }))
        setCVs(mapped)
      } catch (err) {
        console.error('Error loading applications', err)
        setError('Failed to load applications')
      }
    }

    const fetchJobsAndApplications = async () => {
      try {
        setLoading(true)
        setError('')
        const jobsRes = await getAllJobs()
        const jobsData = jobsRes.data || []
        setJobs(jobsData)

        // Load applications for first job by default
        if (jobsData.length > 0) {
          const firstJob = jobsData[0]
          await loadApplicationsForJob(firstJob._id, firstJob.title)
        } else {
          setCVs([])
        }
      } catch (err) {
        console.error('Error loading jobs/applications', err)
        setError('Failed to load hiring data')
      } finally {
        setLoading(false)
      }
    }

    fetchJobsAndApplications()

    // expose function for use in handlers (hacky but simple for now)
    Hiring._loadApplicationsForJob = loadApplicationsForJob
  }, [])

  const handlePositionChange = (position) => {
    setSelectedPosition(position)
    if (position === 'All Positions') {
      // For simplicity, reload first job's applications
      if (jobs.length > 0 && Hiring._loadApplicationsForJob) {
        Hiring._loadApplicationsForJob(jobs[0]._id, jobs[0].title)
      }
    } else {
      const job = jobs.find((j) => j.title === position)
      if (job && Hiring._loadApplicationsForJob) {
        Hiring._loadApplicationsForJob(job._id, job.title)
      }
    }
  }

  const handleViewCV = (cv) => {
    setSelectedCV(cv)
    setViewMode('manual')
    // Mark as viewed
    setCVs(cvs.map(c => c.id === cv.id ? { ...c, status: 'Viewed' } : c))
  }

  const handleDeleteCV = (id) => {
    setCVs(cvs.filter(cv => cv.id !== id))
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedCV(null)
  }

  const handleUpdateStatus = async (cv, newStatus) => {
    if (!cv?.id) return
    // Optimistic UI update
    setCVs(prev =>
      prev.map((c) => (c.id === cv.id ? { ...c, status: newStatus } : c))
    )
    try {
      await updateApplicationStatus(cv.id, newStatus)
    } catch (err) {
      console.error('Error updating status', err)
      // Revert if failed
      setCVs(prev =>
        prev.map((c) => (c.id === cv.id ? { ...c, status: cv.status } : c))
      )
      setError('Failed to update application status')
    }
  }

  return (
    <div className="hiring-page">
      <h1 className="page-title">Hello Thomas</h1>
      
      <div className="hiring-section">
        <div className="section-header">
          <h2 className="section-heading">Hiring</h2>
          <div className="stats-info">
            <span className="stat-item">
              Total CVs: <strong>{cvs.length}</strong>
            </span>
            <span className="stat-item unviewed">
              Unviewed: <strong>{unviewedCount}</strong>
            </span>
          </div>
        </div>

        {loading && <div className="no-openings">Loading hiring data...</div>}
        {error && !loading && <div className="no-openings">{error}</div>}

        {viewMode === 'list' && (
          <>
            <PositionFilter
              positions={positions}
              selectedPosition={selectedPosition}
              onPositionChange={handlePositionChange}
            />

            <div className="review-options">
              <div className="option-card manual-option" onClick={() => setViewMode('manual')}>
                <div className="option-icon">📄</div>
                <h3>Manual Review</h3>
                <p>Review CVs manually by opening each one</p>
              </div>
              <div className="option-card ai-option" onClick={() => setViewMode('ai')}>
                <div className="option-icon">🤖</div>
                <h3>AI Filtering</h3>
                <p>Use AI to filter CVs that match job descriptions</p>
              </div>
            </div>

            <CVList
              cvs={filteredCVs}
              onViewCV={handleViewCV}
              onDeleteCV={handleDeleteCV}
            />
          </>
        )}

        {viewMode === 'manual' && (
          <ManualReview
            cv={selectedCV}
            onBack={handleBackToList}
            onNext={() => {
              const currentIndex = filteredCVs.findIndex(c => c.id === selectedCV.id)
              const nextCV = filteredCVs[currentIndex + 1] || filteredCVs[0]
              if (nextCV) {
                setSelectedCV(nextCV)
                setCVs(cvs.map(c => c.id === nextCV.id ? { ...c, status: 'Viewed' } : c))
              }
            }}
            onPrevious={() => {
              const currentIndex = filteredCVs.findIndex(c => c.id === selectedCV.id)
              const prevCV = filteredCVs[currentIndex - 1] || filteredCVs[filteredCVs.length - 1]
              if (prevCV) {
                setSelectedCV(prevCV)
                setCVs(cvs.map(c => c.id === prevCV.id ? { ...c, status: 'Viewed' } : c))
              }
            }}
            totalCVs={filteredCVs.length}
            currentIndex={filteredCVs.findIndex(c => c.id === selectedCV?.id) + 1}
            onShortlist={() => handleUpdateStatus(selectedCV, 'Shortlisted')}
            onReject={() => handleUpdateStatus(selectedCV, 'Rejected')}
          />
        )}

        {viewMode === 'ai' && (
          <AIFiltering
            cvs={filteredCVs}
            selectedPosition={selectedPosition}
            onBack={handleBackToList}
            onViewCV={handleViewCV}
          />
        )}
      </div>
    </div>
  )
}

export default Hiring

