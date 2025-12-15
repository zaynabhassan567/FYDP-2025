import { useState } from 'react'
import Login from './pages/Login/Login'
import Sidebar from './components/Sidebar/Sidebar'
import EmployeeSidebar from './components/EmployeeSidebar/EmployeeSidebar'
import ApplicantSidebar from './components/ApplicantSidebar/ApplicantSidebar'
import Employee from './pages/Employee/Employee'
import Hiring from './pages/Hiring/Hiring'
import EmployeeDashboard from './pages/EmployeeDashboard/EmployeeDashboard'
import ApplicantOpenings from './pages/ApplicantOpenings/ApplicantOpenings'
import ApplicantApplications from './pages/ApplicantApplications/ApplicantApplications'
import AdminOpenings from './pages/AdminOpenings/AdminOpenings'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null) // 'employee' | 'administrator' | 'applicant'
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [showSubmenu, setShowSubmenu] = useState(false)
  const [unviewedCVsCount] = useState(5) // This would come from your data/API

  // Shared openings and applications data
  const [openings, setOpenings] = useState([
    {
      id: 'OP001',
      title: 'Senior Software Engineer',
      department: 'Technology',
      location: 'Remote',
      type: 'Full-time',
      postedDate: '15 Nov, 2024',
      applicants: 25,
      status: 'Active'
    },
    {
      id: 'OP002',
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: 'Full-time',
      postedDate: '14 Nov, 2024',
      applicants: 18,
      status: 'Active'
    },
    {
      id: 'OP003',
      title: 'UX Designer',
      department: 'Design',
      location: 'San Francisco, CA',
      type: 'Full-time',
      postedDate: '13 Nov, 2024',
      applicants: 32,
      status: 'Active'
    }
  ])

  const [applications, setApplications] = useState([
    {
      openingId: 'OP001',
      title: 'Senior Software Engineer',
      department: 'Technology',
      status: 'Submitted',
      appliedDate: '12 Nov, 2024',
      applicantName: 'John Applicant',
      email: 'john.applicant@email.com',
      phone: '+1 234 567 8900',
      resumeLink: 'https://drive.google.com/sample-cv',
      response: 'Your application is under review.'
    }
  ])

  const handleApplicantApply = (application) => {
    setApplications([application, ...applications])
  }

  const handleLogin = (role, credentials) => {
    // In a real app, you would validate credentials with an API
    console.log('Login attempt:', role, credentials)
    setIsLoggedIn(true)
    setUserRole(role)
    // Set default menu based on role
    if (role === 'employee') {
      setActiveMenu('Dashboard')
    } else if (role === 'applicant') {
      setActiveMenu('Openings')
    } else {
      setActiveMenu('Employee')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole(null)
    setActiveMenu('Dashboard')
  }

  const renderAdminPage = () => {
    switch (activeMenu) {
      case 'Employee':
        return <Employee />
      case 'Hiring':
        return <Hiring />
      case 'Admin Openings':
        return <AdminOpenings openings={openings} setOpenings={setOpenings} />
      case 'Dashboard':
        return <div className="page-placeholder">Dashboard Page - Coming Soon</div>
      case 'Salary':
        return <div className="page-placeholder">Salary Page - Coming Soon</div>
      case 'Projects':
        return <div className="page-placeholder">Projects Page - Coming Soon</div>
      case 'Time Sheet':
        return <div className="page-placeholder">Time Sheet Page - Coming Soon</div>
      case 'Messages':
        return <div className="page-placeholder">Messages Page - Coming Soon</div>
      case 'Users':
        return <div className="page-placeholder">Users Page - Coming Soon</div>
      case 'Role':
        return <div className="page-placeholder">Role Page - Coming Soon</div>
      default:
        return <Employee />
    }
  }

  const renderEmployeePage = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return <EmployeeDashboard />
      default:
        return <EmployeeDashboard />
    }
  }

  const renderApplicantPage = () => {
    switch (activeMenu) {
      case 'Openings':
        return (
          <ApplicantOpenings
            openings={openings.filter((o) => o.status === 'Active')}
            onApply={handleApplicantApply}
          />
        )
      case 'Applications':
        return <ApplicantApplications applications={applications} />
      default:
        return (
          <ApplicantOpenings
            openings={openings.filter((o) => o.status === 'Active')}
            onApply={handleApplicantApply}
          />
        )
    }
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  // Render based on user role
  return (
    <div className="hr-app">
      {userRole === 'employee' ? (
        <>
          <EmployeeSidebar
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
          />
          <main className="main-content">
            <div className="content-wrapper">
              <div className="header-actions">
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
              {renderEmployeePage()}
            </div>
          </main>
        </>
      ) : userRole === 'applicant' ? (
        <>
          <ApplicantSidebar
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
          />
          <main className="main-content">
            <div className="content-wrapper">
              <div className="header-actions">
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
              {renderApplicantPage()}
            </div>
          </main>
        </>
      ) : (
        <>
          <Sidebar
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            showSubmenu={showSubmenu}
            setShowSubmenu={setShowSubmenu}
            unviewedCVsCount={unviewedCVsCount}
          />
          <main className="main-content">
            <div className="content-wrapper">
              <div className="header-actions">
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
              {renderAdminPage()}
            </div>
          </main>
        </>
      )}
    </div>
  )
}

export default App
