import './EmployeeSidebar.css'

function EmployeeSidebar({ activeMenu, setActiveMenu }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h2 className="sidebar-logo">HR System</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-menu">
            <li>
              <a 
                href="#" 
                className={activeMenu === 'Dashboard' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveMenu('Dashboard'); }}
              >
                Dashboard
              </a>
            </li>
          </ul>
        </nav>

        <div className="sidebar-illustration">
          <div className="illustration-placeholder">
            👤
          </div>
        </div>
      </div>
    </aside>
  )
}

export default EmployeeSidebar

