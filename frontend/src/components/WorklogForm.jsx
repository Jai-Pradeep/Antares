import React, { useState, useEffect } from 'react'

const STATUS_OPTIONS = ['Present', 'On Leave', 'Work From Home', 'On Site', 'Travel']

const emptyForm = {
  location: '',
  project: '',
  distance: '',
  status: '',
  remarks: '',
}

export default function WorklogForm({ existing, onSubmit, loading }) {
  const [form, setForm] = useState(
  {
    location: existing?.location || '',
    project: existing?.project || '',
    distance: existing?.distance || '',
    status: existing?.status || '',
    remarks: existing?.remarks || ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (existing) {
      setForm({
        location: existing.location || '',
        project: existing.project || '',
        distance: existing.distance || '',
        status: existing.status || '',
        remarks: existing.remarks || ''
      })
    }
  }, [existing])

  const validate = () => {
    const e = {}
    if (!form.location.trim()) e.location = 'Location is required'
    if (!form.project.trim()) e.project = 'Project is required'
    if (form.distance === '' || isNaN(Number(form.distance))) e.distance = 'Enter a valid distance'
    if (!form.status) e.status = 'Status is required'
    return e
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) {
      setErrors(e2)
      return
    }
    onSubmit({ ...form, distance: Number(form.distance) })
  }

  const isEdit = !!existing

  return (
    <form className="worklog-form" onSubmit={handleSubmit} >
      <div className="form-row">
        <div className="form-group">
          <label>Location</label>
          <input
            name="location"
            type="text"
            placeholder="e.g. Chennai Office"
            value={form.location}
            onChange={handleChange}
          />
          {errors.location && <span className="field-error">{errors.location}</span>}
        </div>

        <div className="form-group" >
          <label>Project</label>
          <input
            name="project"
            type="text"
            placeholder="e.g. Project Alpha"
            value={form.project}
            onChange={handleChange}
          />
          {errors.project && <span className="field-error">{errors.project}</span>}
        </div>
      </div>

      <div className="form-row" autoComplete="off">
        <div className="form-group">
          <label>Distance (km)</label>
          <input
            name="distance"
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            value={form.distance}
            onChange={handleChange}
          />
          {errors.distance && <span className="field-error">{errors.distance}</span>}
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="">Select status</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.status && <span className="field-error">{errors.status}</span>}
        </div>
      </div>

      <div className="form-group" autoComplete="off">
        <label>Remarks</label>
        <textarea
          name="remarks"
          rows={3}
          placeholder="Mention Travel details..."
          value={form.remarks}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading
            ? <><span className="btn-spinner" /> Saving...</>
            : isEdit ? 'Update Worklog' : 'Submit Worklog'
          }
        </button>
      </div>
    </form>
  )
}