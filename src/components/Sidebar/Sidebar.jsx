import './Sidebar.css'

function Sidebar({ activeMenu, setActiveMenu, showSubmenu, setShowSubmenu, unviewedCVsCount = 0 }) {
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
            <li className="nav-item-with-submenu">
              <a 
                href="#" 
                className={activeMenu === 'Employee' ? 'active' : ''}
                onClick={(e) => { 
                  e.preventDefault(); 
                  setActiveMenu('Employee'); 
                  setShowSubmenu(!showSubmenu);
                }}
              >
                Employee
                <span className="submenu-arrow">{showSubmenu ? '▼' : '▶'}</span>
              </a>
              {showSubmenu && (
                <ul className="submenu">
                  <li>
                    <a 
                      href="#" 
                      className={activeMenu === 'Documents' ? 'submenu-item active' : 'submenu-item'}
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setActiveMenu('Documents'); 
                      }}
                    >
                      Documents
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className={activeMenu === 'Assets' ? 'submenu-item active' : 'submenu-item'}
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setActiveMenu('Assets'); 
                      }}
                    >
                      Assets
                    </a>
                  </li>
                </ul>
              )}
            </li>
            <li>
              <a 
                href="#" 
                className={activeMenu === 'Hiring' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveMenu('Hiring'); }}
              >
                Hiring
                {unviewedCVsCount > 0 && (
                  <span className="nav-badge">{unviewedCVsCount}</span>
                )}
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={activeMenu === 'Salary' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveMenu('Salary'); }}
              >
                Salary
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={activeMenu === 'Projects' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveMenu('Projects'); }}
              >
                Projects
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={activeMenu === 'Time Sheet' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveMenu('Time Sheet'); }}
              >
                Time Sheet
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={activeMenu === 'Messages' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveMenu('Messages'); }}
              >
                Messages
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={activeMenu === 'Users' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveMenu('Users'); }}
              >
                Users
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={activeMenu === 'Role' ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); setActiveMenu('Role'); }}
              >
                Role
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

export default Sidebar

