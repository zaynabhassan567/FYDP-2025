import { useState } from 'react'
import CVList from './components/CVList/CVList'
import PositionFilter from './components/PositionFilter/PositionFilter'
import ManualReview from './components/ManualReview/ManualReview'
import AIFiltering from './components/AIFiltering/AIFiltering'
import './Hiring.css'

function Hiring() {
  const [selectedPosition, setSelectedPosition] = useState('')
  const [selectedCV, setSelectedCV] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list', 'manual', 'ai'

  const [cvs, setCVs] = useState([
    {
      id: 'CV001',
      applicantName: 'John Smith',
      email: 'john.smith@email.com',
      position: 'Software Engineer',
      uploadedDate: '15 Nov, 2024',
      status: 'Unviewed',
      fileName: 'john_smith_resume.pdf',
      matchScore: null
    },
    {
      id: 'CV002',
      applicantName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      position: 'Product Manager',
      uploadedDate: '14 Nov, 2024',
      status: 'Unviewed',
      fileName: 'sarah_johnson_resume.pdf',
      matchScore: null
    },
    {
      id: 'CV003',
      applicantName: 'Michael Chen',
      email: 'michael.chen@email.com',
      position: 'Software Engineer',
      uploadedDate: '13 Nov, 2024',
      status: 'Viewed',
      fileName: 'michael_chen_resume.pdf',
      matchScore: null
    },
    {
      id: 'CV004',
      applicantName: 'Emily Davis',
      email: 'emily.davis@email.com',
      position: 'UX Designer',
      uploadedDate: '12 Nov, 2024',
      status: 'Unviewed',
      fileName: 'emily_davis_resume.pdf',
      matchScore: null
    },
    {
      id: 'CV005',
      applicantName: 'David Wilson',
      email: 'david.w@email.com',
      position: 'Software Engineer',
      uploadedDate: '11 Nov, 2024',
      status: 'Unviewed',
      fileName: 'david_wilson_resume.pdf',
      matchScore: null
    },
    {
      id: 'CV006',
      applicantName: 'Lisa Anderson',
      email: 'lisa.a@email.com',
      position: 'Data Analyst',
      uploadedDate: '10 Nov, 2024',
      status: 'Unviewed',
      fileName: 'lisa_anderson_resume.pdf',
      matchScore: null
    }
  ])

  const positions = ['All Positions', 'Software Engineer', 'Product Manager', 'UX Designer', 'Data Analyst', 'Marketing Manager']

  const filteredCVs = selectedPosition && selectedPosition !== 'All Positions'
    ? cvs.filter(cv => cv.position === selectedPosition)
    : cvs

  const unviewedCount = cvs.filter(cv => cv.status === 'Unviewed').length

  const handlePositionChange = (position) => {
    setSelectedPosition(position)
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

