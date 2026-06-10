import React from 'react'

function StatusBadge({ status }) {
  const map = {
    'Present': 'status-present',
    'On Leave': 'status-leave',
    'Work From Home': 'status-wfh',
    'On Site': 'status-onsite',
    'Travel': 'status-travel',
  }
  return <span className={`status-pill ${map[status] || 'status-default'}`}>{status || '—'}</span>
}

export default function AdminTable({ logs, loading }) {
  if (loading) {
    return (
      <div className="table-placeholder">
        <div className="loading-spinner" />
        <p>Loading worklogs...</p>
      </div>
    )
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="table-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <p>No worklogs match your filters.</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper table-wrapper-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Emp. Code</th>
            <th>Employee Name</th>
            <th>Date</th>
            <th>Location</th>
            <th>Project</th>
            <th>Distance (km)</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td className="td-code">{log.employee_code || '—'}</td>
              <td style={{ fontWeight: 500 }}>{log.name || '—'}</td>
              <td className="td-date">{log.date ? new Date(log.date).toLocaleDateString('en-GB') : '—'}</td>
              <td>{log.location || '—'}</td>
              <td>{log.project || '—'}</td>
              <td>{log.distance ?? '—'}</td>
              <td><StatusBadge status={log.status} /></td>
              <td className="td-remarks">{log.remarks || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
