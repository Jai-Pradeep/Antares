import React, { useEffect, useState } from 'react'
import api, { deleteEmployee } from '../services/api'

function ResetPasswordModal({ employeeCode, onClose }) {
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!newPassword.trim()) {
      setMsg({ type: 'error', text: 'Please enter a new password.' })
      return
    }
    if (newPassword.trim().length < 4) {
      setMsg({ type: 'error', text: 'Password must be at least 4 characters.' })
      return
    }
    setLoading(true)
    setMsg({ type: '', text: '' })
    try {
      await api.put(`/admin/reset-password/${employeeCode}`, { newPassword: newPassword.trim() })
      setMsg({ type: 'success', text: `Password reset successfully for ${employeeCode}.` })
      setNewPassword('')
      setTimeout(() => onClose(), 1400)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reset password.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="inline-modal">
        <div className="inline-modal-header">
          <div className="inline-modal-title-group">
            <span className="card-icon" style={{ width: 30, height: 30 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <div>
              <h4 className="inline-modal-title">Reset Password</h4>
              <p className="inline-modal-sub">Employee: <span className="td-code">{employeeCode}</span></p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form className="inline-modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setMsg({ type: '', text: '' }) }}
              autoFocus
            />
          </div>

          {msg.text && (
            <div className={`alert alert-${msg.type}`} style={{ margin: '0 0 4px' }}>
              {msg.text}
            </div>
          )}

          <div className="inline-modal-actions">
            <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Resetting...</> : 'Reset Password'}
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RoleBadge({ role }) {
  return (
    <span className={`badge ${role === 'admin' ? 'badge-admin' : 'badge-employee'}`}>
      {role}
    </span>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export default function EmployeeList({ refreshKey = 0 }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resetTarget, setResetTarget] = useState(null) // employee_code string

  const loadEmployees = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/admin/employees')
      setEmployees(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [refreshKey])

  return (
    <>
      {resetTarget && (
        <ResetPasswordModal
          employeeCode={resetTarget}
          onClose={() => setResetTarget(null)}
        />
      )}

      <div className="card section-card">
        <div className="card-header">
          <div className="card-title-group">
            <span className="card-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            <h3 className="card-title">Employee List</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="record-count">{employees.length} employees</span>
            <button className="btn btn-ghost btn-sm" onClick={loadEmployees} disabled={loading}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }}>
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ margin: '16px 24px 0' }}>{error}</div>
        )}

        {loading ? (
          <div className="table-placeholder">
            <div className="loading-spinner" />
            <p>Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="table-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <p>No employees found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.employee_code}>
                    <td className="td-code">{emp.employee_code}</td>
                    <td style={{ fontWeight: 500 }}>{emp.name}</td>
                    <td><RoleBadge role={emp.role} /></td>
                    <td className="td-date">{formatDate(emp.created_at)}</td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-ghost btn-sm reset-pwd-btn"
                        onClick={() => setResetTarget(emp.employee_code)}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Reset Password
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={async () => {

                          const confirmDelete = window.confirm(
                            `Delete ${emp.employee_code}?`
                          );

                          if (!confirmDelete) return;

                          try {

                            await deleteEmployee(emp.employee_code);

                            alert("Employee deleted");

                            loadEmployees();

                          } catch (err) {

                            alert(
                              err.response?.data?.message ||
                              "Delete failed"
                            );
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
