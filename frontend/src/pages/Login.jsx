import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useTheme } from '../context/ThemeContext.jsx'

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}



export default function Login() {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()
  const [form, setForm] = useState({ employee_code: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.employee_code || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const res = await login(form.employee_code.trim().toUpperCase(), form.password)
      const token = res.data.token
      localStorage.setItem('token', token)
      const decoded = parseJwt(token)
            console.log(decoded)
      navigate(decoded?.role?.toLowerCase() === 'admin' ? '/admin' : '/dashboard', { replace: true })

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg">

      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-mark">AW</span>
        </div>
        <h1 className="login-title">Worklog System</h1>
        <p className="login-subtitle">Sign in to your account</p>

        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="employee_code">Employee Code</label>
            <input
              id="employee_code"
              name="employee_code"
              type="text"
              placeholder="e.g. AW001"
              value={form.employee_code}
              onChange={handleChange}
              autoComplete="username"
              spellCheck={false}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}