import { useState } from 'react'
import { login as employeeLogin, signup as employeeSignup } from '../../api'
import './Login.css'

function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [employeeCode, setEmployeeCode] = useState('')
  const [salary, setSalary] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedRole || !email || !password) return

    // Employee uses real backend auth
    if (selectedRole === 'employee') {
      try {
        setLoading(true)

        if (mode === 'signup') {
          // 1) Signup call
          const payload = {
            full_name: fullName,
            email,
            password,
            employee_code: employeeCode,
            role: 'Employee',
            salary: Number(salary) || 0
          }

          await employeeSignup(payload)
          // 2) Auto-login after successful signup
        }

        const res = await employeeLogin({ email, password })
        const data = res.data

        // Save token for future API calls
        if (data?.access_token) {
          localStorage.setItem('token', data.access_token)
        }

        onLogin('employee', {
          token: data.access_token,
          role: data.user_role,
          name: data.user_name,
          email,
          employeeId: data.employee_id,
          employeeCode: data.employee_code,
          salary: data.salary
        })
      } catch (err) {
        console.error('Employee auth error', err)
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          'Login failed. Please check your credentials.'
        setError(msg)
      } finally {
        setLoading(false)
      }
      return
    }

    // Admin / Applicant still dummy for now
    onLogin(selectedRole, { email, password })
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
            {selectedRole === 'employee' && mode === 'signup' && (
              <>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="employeeCode">Employee Code</label>
                  <input
                    type="text"
                    id="employeeCode"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="EMP001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="salary">Salary (optional)</label>
                  <input
                    type="number"
                    id="salary"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="75000"
                    min="0"
                  />
                </div>
              </>
            )}

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

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-button">
              {loading
                ? 'Please wait...'
                : mode === 'signup' && selectedRole === 'employee'
                ? 'Sign Up & Login'
                : 'Login'}
            </button>

            {selectedRole === 'employee' && (
              <div className="auth-toggle">
                {mode === 'login' ? (
                  <span>
                    New employee?{' '}
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setMode('signup')}
                    >
                      Sign up
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setMode('login')}
                    >
                      Login
                    </button>
                  </span>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default Login

