import React, { useState } from 'react'
import api from '../services/api'

export default function ChangePassword({ onClose }) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    setMsg({ type: '', text: '' })
  }

  const validate = () => {
    const e = {}
    if (!form.oldPassword) e.oldPassword = 'Current password is required'
    if (!form.newPassword) e.newPassword = 'New password is required'
    else if (form.newPassword.length < 4) e.newPassword = 'Must be at least 4 characters'
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your new password'
    else if (form.newPassword && form.confirmPassword !== form.newPassword)
      e.confirmPassword = 'Passwords do not match'
    if (form.oldPassword && form.newPassword && form.oldPassword === form.newPassword)
      e.newPassword = 'New password must differ from current password'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    setMsg({ type: '', text: '' })
    try {
      await api.put('/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      })
      setMsg({ type: 'success', text: 'Password changed successfully!' })
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => onClose(), 1400)
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="inline-modal inline-modal--wide">
        <div className="inline-modal-header">
          <div className="inline-modal-title-group">
            <span className="card-icon" style={{ width: 30, height: 30 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <div>
              <h4 className="inline-modal-title">Change Password</h4>
              <p className="inline-modal-sub">Update your account password</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form className="inline-modal-body" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label>Current Password</label>
            <input
              name="oldPassword"
              type="password"
              placeholder="Enter current password"
              value={form.oldPassword}
              onChange={handleChange}
              autoFocus
              autoComplete="current-password"
            />
            {errors.oldPassword && <span className="field-error">{errors.oldPassword}</span>}
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label>New Password</label>
            <input
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label>Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          {msg.text && (
            <div className={`alert alert-${msg.type}`} style={{ margin: '14px 0 0' }}>
              {msg.text}
            </div>
          )}

          <div className="inline-modal-actions" style={{ marginTop: 18 }}>
            <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
              {loading ? <><span className="btn-spinner" /> Saving...</> : 'Change Password'}
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
