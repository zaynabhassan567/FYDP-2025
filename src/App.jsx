import { useState } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Employee from './pages/Employee/Employee'
import Documents from './pages/Employee/Documents/Documents'
import Assets from './pages/Employee/Assets/Assets'
import Hiring from './pages/Hiring/Hiring'
import './App.css'

function App() {
  const [activeMenu, setActiveMenu] = useState('Employee')
  const [showSubmenu, setShowSubmenu] = useState(true)
  const [unviewedCVsCount] = useState(5) // This would come from your data/API

  const renderPage = () => {
    switch (activeMenu) {
      case 'Employee':
        return <Employee />
      case 'Documents':
        return <Documents />
      case 'Assets':
        return <Assets />
      case 'Hiring':
        return <Hiring />
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

  return (
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
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App
