import { useState } from 'react'
import './Login.css'

function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedRole && email && password) {
      onLogin(selectedRole, { email, password })
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-logo">HR System</h1>
          <p className="login-subtitle">Welcome back! Please login to continue.</p>
        </div>

        <div className="role-selection">
          <h2 className="role-selection-title">Select Login Type</h2>
          <div className="role-options">
            <button
              className={`role-card ${selectedRole === 'employee' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('employee')}
            >
              <div className="role-icon">👤</div>
              <h3>Employee</h3>
              <p>Login as an employee</p>
            </button>
            <button
              className={`role-card ${selectedRole === 'administrator' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('administrator')}
            >
              <div className="role-icon">👔</div>
              <h3>Administrator</h3>
              <p>Login as an administrator</p>
            </button>
            <button
              className={`role-card ${selectedRole === 'applicant' ? 'selected' : ''}`}
              onClick={() => handleRoleSelect('applicant')}
            >
              <div className="role-icon">🧑‍💼</div>
              <h3>Applicant</h3>
              <p>Explore openings and track your applications</p>
            </button>
          </div>
        </div>

        {selectedRole && (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login

