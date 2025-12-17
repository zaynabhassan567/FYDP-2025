import { useState } from 'react'
import { login as employeeLogin, signup as employeeSignup } from '../../api'
import './Login.css'

function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [employeeCode, setEmployeeCode] = useState('')
  const [cnic, setCnic] = useState('')
  const [mobile, setMobile] = useState('')
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
          // Validate CNIC (13 digits)
          if (!cnic || cnic.length !== 13 || !/^\d+$/.test(cnic)) {
            setError('CNIC must be exactly 13 digits')
            setLoading(false)
            return
          }

          // 1) Signup call - verifies CNIC and employee_code match existing record
          const payload = {
            full_name: fullName,
            email,
            password,
            employee_code: employeeCode,
            cnic: cnic,
            role: 'Employee',
            salary: 0, // Salary will be set by administrator later
            mobile: mobile || null
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
                  <label htmlFor="cnic">CNIC Number</label>
                  <input
                    type="text"
                    id="cnic"
                    value={cnic}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '') // Only digits
                      if (value.length <= 13) {
                        setCnic(value)
                      }
                    }}
                    placeholder="1234567890123"
                    maxLength={13}
                    required
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>13 digits only</small>
                </div>
                <div className="form-group">
                  <label htmlFor="mobile">Mobile Number (Optional)</label>
                  <input
                    type="text"
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+92 300 1234567"
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

            {error && (
              <div className="login-error">
                <div className="error-message">{error}</div>
                {(error.includes('CNIC') || error.includes('Email') || error.includes('already') || error.includes('not enrolled')) && (
                  <button
                    type="button"
                    className="try-again-button"
                    onClick={() => {
                      setError('')
                      if (mode === 'signup' && selectedRole === 'employee') {
                        setCnic('')
                        setEmail('')
                        setFullName('')
                        setEmployeeCode('')
                        setMobile('')
                      }
                    }}
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            <button type="submit" className="login-button" disabled={loading}>
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

