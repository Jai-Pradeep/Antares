import React, { useState } from 'react'
import { createEmployee } from '../services/api'

const emptyForm = { name: '', employee_code: '', password: '' , email: ''}

export default function CreateEmployeeForm({ onCreated }) {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.password.trim()) e.password = 'Password is required'
    if (form.employee_code && !/^AW\d{3}$/.test(form.employee_code.trim().toUpperCase())) {
      e.employee_code = 'Format: AW followed by 3 digits (e.g. AW105)'
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = 'Enter a valid email'
    }
    return e
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      const body = { name: form.name.trim(), password: form.password.trim(), email: form.email.trim() }
      if (form.employee_code.trim()) {
        body.employee_code = form.employee_code.trim().toUpperCase()
      }
      const res = await createEmployee(body)
      const created = res.data
      setSuccess(
        `Employee "${created.name}" created successfully! Code: ${created.employee_code}`
      )
      setForm(emptyForm)
      if (onCreated) onCreated(created)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="worklog-form" onSubmit={handleSubmit} autoComplete="off">
      <div className="form-row">
        <div className="form-group">
          <label>Full Name <span className="required">*</span></label>
          <input
            name="name"
            type="text"
            placeholder="e.g. Jai Pradeep"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Employee Code <span className="optional">(optional — auto-generated)</span></label>
          <input
            name="employee_code"
            type="text"
            placeholder="e.g. AW105"
            value={form.employee_code}
            onChange={handleChange}
            style={{ textTransform: 'uppercase' }}
          />
          {errors.employee_code && <span className="field-error">{errors.employee_code}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Password <span className="required">*</span></label>
          <input
            name="password"
            type="password"
            placeholder="Set initial password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>
      

     
        <div className="form-group">
          <label>Email <span className="required">*</span></label>
          <input
            name="email"
            type="email"
            placeholder="e.g. jai.pradeep@gmail.com"
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <><span className="btn-spinner" /> Creating...</> : 'Create Employee'}
        </button>
      </div>
    </form>
  )
}