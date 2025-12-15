import './ApplicantSidebar.css'

function ApplicantSidebar({ activeMenu, setActiveMenu }) {
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
                className={activeMenu === 'Openings' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveMenu('Openings')
                }}
              >
                Openings
              </a>
            </li>
            <li>
              <a
                href="#"
                className={activeMenu === 'Applications' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveMenu('Applications')
                }}
              >
                My Applications
              </a>
            </li>
          </ul>
        </nav>

        <div className="sidebar-illustration">
          <div className="illustration-placeholder">📄</div>
        </div>
      </div>
    </aside>
  )
}

export default ApplicantSidebar

