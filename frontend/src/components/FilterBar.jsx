import React, { useState } from 'react'

const currentMonth = () => new Date().toLocaleDateString('en-CA').slice(0, 7)

export default function FilterBar({ onFilter, loading }) {
  const [filters, setFilters] = useState({
    month: currentMonth(),
    date: '',
    project: '',
    employee_code: ''
  })

  const handleChange = e => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
      ...(name === 'month' && value ? { date: '' } : {})
    })
  }

  const handleSubmit = e => {
    e.preventDefault()
    const clean = {}
    if (filters.date) clean.date = filters.date
    else if (filters.month) clean.month = filters.month
    if (filters.project.trim()) clean.project = filters.project.trim()
    if (filters.employee_code.trim()) clean.employee_code = filters.employee_code.trim().toUpperCase()
    onFilter(clean)
  }

  const handleClear = () => {
    const month = currentMonth()
    setFilters({ month, date: '', project: '', employee_code: '' })
    onFilter({ month })
  }

  return (
    <form className="filter-bar" onSubmit={handleSubmit}>
      <div className="filter-fields">
        <div className="form-group filter-group">
          <label>Month</label>
          <input
            name="month"
            type="month"
            value={filters.month}
            onChange={handleChange}
          />
        </div>

        <div className="form-group filter-group">
          <label>Specific Date <span className="optional">(optional)</span></label>
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
