import React, { useState } from 'react'

export default function FilterBar({ onFilter, loading }) {
  const [filters, setFilters] = useState({ date: '', project: '', employee_code: '' })

  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    const clean = {}
    if (filters.date) clean.date = filters.date
    if (filters.project.trim()) clean.project = filters.project.trim()
    if (filters.employee_code.trim()) clean.employee_code = filters.employee_code.trim().toUpperCase()
    onFilter(clean)
  }

  const handleClear = () => {
    setFilters({ date: '', project: '', employee_code: '' })
    onFilter({})
  }

  return (
    <form className="filter-bar" onSubmit={handleSubmit}>
      <div className="filter-fields">
        <div className="form-group filter-group">
          <label>Date</label>
          <input
            name="date"
            type="date"
            value={filters.date}
            onChange={handleChange}
          />
        </div>

        <div className="form-group filter-group">
          <label>Project</label>
          <input
            name="project"
            type="text"
            placeholder="Filter by project"
            value={filters.project}
            onChange={handleChange}
          />
        </div>

        <div className="form-group filter-group">
          <label>Employee Code</label>
          <input
            name="employee_code"
            type="text"
            placeholder="e.g. AW002"
            value={filters.employee_code}
            onChange={handleChange}
            style={{ textTransform: 'uppercase' }}
          />
        </div>
      </div>

      <div className="filter-actions">
        <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
          Apply Filters
        </button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={handleClear}>
          Clear
        </button>
      </div>
    </form>
  )
}