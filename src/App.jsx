import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
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
import AdminLeaves from './pages/AdminLeaves/AdminLeaves'
import AdminAttendance from './pages/AdminAttendance/AdminAttendance'
import './App.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const stored = localStorage.getItem('auth')
    return !!stored
  })
  const [userRole, setUserRole] = useState(() => {
    const stored = localStorage.getItem('auth')
    if (!stored) return null
    try {
      return JSON.parse(stored).role
    } catch {
      return null
    }
  }) // 'employee' | 'administrator' | 'applicant'
  const [userInfo, setUserInfo] = useState(() => {
    const stored = localStorage.getItem('auth')
    if (!stored) return null
    try {
      return JSON.parse(stored).userInfo
    } catch {
      return null
    }
  })
  const [activeMenu, setActiveMenuState] = useState(() => {
    return localStorage.getItem('activeMenu') || 'Dashboard'
  })
  const [showSubmenu, setShowSubmenu] = useState(false)
  const [unviewedCVsCount] = useState(5) // This would come from your data/API

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

  const setActiveMenu = (menu) => {
    setActiveMenuState(menu)
    localStorage.setItem('activeMenu', menu)
  }

  const handleLogin = (role, authData) => {
    console.log('Login attempt:', role, authData)
    setIsLoggedIn(true)
    setUserRole(role)
    setUserInfo(authData || null)
    // Set default menu based on role
    let defaultMenu = 'Dashboard'
    if (role === 'employee') {
      defaultMenu = 'Dashboard'
    } else if (role === 'applicant') {
      defaultMenu = 'Openings'
    } else {
      defaultMenu = 'Employee'
    }
    setActiveMenu(defaultMenu)
    localStorage.setItem(
      'auth',
      JSON.stringify({
        role,
        userInfo: authData || null
      })
    )
    localStorage.setItem('activeMenu', defaultMenu)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserRole(null)
    setActiveMenu('Dashboard')
    localStorage.removeItem('auth')
    localStorage.removeItem('activeMenu')
    navigate('/login', { replace: true })
  }

  // Ensure URL matches auth state on first load
  useEffect(() => {
    if (!isLoggedIn) {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true })
      }
      return
    }

    // Logged in: redirect base paths to role-specific default if needed
    const defaultPath =
      userRole === 'employee'
        ? '/employee/dashboard'
        : userRole === 'applicant'
        ? '/applicant/openings'
        : '/admin/employee'

    if (location.pathname === '/' || location.pathname === '/login') {
      navigate(defaultPath, { replace: true })
    }
  }, [isLoggedIn, userRole, location.pathname, navigate])

  const renderAdminPage = () => {
    switch (activeMenu) {
      case 'Employee':
        return <Employee />
      case 'Hiring':
        return <Hiring />
      case 'Admin Openings':
        return <AdminOpenings />
      case 'Leaves':
        return <AdminLeaves />
      case 'Attendance':
        return <AdminAttendance />
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
        return <EmployeeDashboard user={userInfo} />
      default:
        return <EmployeeDashboard user={userInfo} />
    }
  }

  const renderApplicantPage = () => {
    switch (activeMenu) {
      case 'Openings':
        return (
          <ApplicantOpenings onApply={handleApplicantApply} />
        )
      case 'Applications':
        return <ApplicantApplications applications={applications} />
      default:
        return (
          <ApplicantOpenings onApply={handleApplicantApply} />
        )
    }
  }

  const defaultPath =
    userRole === 'employee'
      ? '/employee/dashboard'
      : userRole === 'applicant'
      ? '/applicant/openings'
      : '/admin/employee'

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to={defaultPath} replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      {/* Employee routes */}
      <Route
        path="/employee/*"
        element={
          !isLoggedIn || userRole !== 'employee' ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="hr-app">
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
            </div>
          )
        }
      />

      {/* Applicant routes */}
      <Route
        path="/applicant/*"
        element={
          !isLoggedIn || userRole !== 'applicant' ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="hr-app">
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
            </div>
          )
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          !isLoggedIn || (userRole !== 'administrator' && userRole !== 'admin') ? (
            <Navigate to="/login" replace />
          ) : (
            <div className="hr-app">
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
            </div>
          )
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={
          isLoggedIn ? (
            <Navigate to={defaultPath} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App
