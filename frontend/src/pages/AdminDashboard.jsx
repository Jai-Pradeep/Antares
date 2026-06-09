import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import AdminTable from '../components/AdminTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import CreateEmployeeForm from '../components/CreateEmployeeForm.jsx'
import { getAllWorklogs, exportWorklogs } from '../services/api'
import EmployeeList from '../components/EmployeeList.jsx'

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
  } catch { return null }
}

export default function AdminDashboard() {
  const token = localStorage.getItem('token')
  const user = parseJwt(token)

  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [fromMonth, setFromMonth] = useState('')
  const [toMonth, setToMonth] = useState('')
  const [exportAll, setExportAll] = useState(true)
  const [employeeListRefreshKey, setEmployeeListRefreshKey] = useState(0)

  const loadLogs = async (params = {}) => {
    setLogsLoading(true)
    try {
      const res = await getAllWorklogs(params)
      setLogs(res.data || [])
    } catch {
      setLogs([])
    } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const handleFilter = (filters) => {
    setActiveFilters(filters)
    loadLogs(filters)
  }

const handleExport = async () => {
  setExportLoading(true)

  try {

    const params = exportAll
      ? { all: true }
      : {
          from: fromMonth,
          to: toMonth
        }

    const res =
      await exportWorklogs(params)

    const url =
      window.URL.createObjectURL(
        new Blob([res.data])
      )

    const link =
      document.createElement('a')

    link.href = url

    const disposition = res.headers['content-disposition']
    const fileName =
      disposition?.match(/filename="?([^"]+)"?$/i)?.[1] ||
      'worklogs.xlsx'

    link.setAttribute('download', fileName)

    document.body.appendChild(link)

    link.click()

    link.parentNode.removeChild(link)

    window.URL.revokeObjectURL(url)

  } catch {

    alert('Export failed. Please try again.')

  } finally {

    setExportLoading(false)
  }
}

  const activeFilterCount = Object.keys(activeFilters).length
  const exportRangeInvalid = !exportAll && (
    !fromMonth ||
    !toMonth ||
    fromMonth > toMonth
  )

  return (    
    <div className="page-wrapper">
      <Navbar userName={user?.name || user?.employee_code} role="admin" />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">Admin Dashboard</h2>
            <p className="page-subtitle">Manage employees and view all worklogs</p>
          </div>
         <div className="page-header-actions">

            <button
              className={`btn btn-outline btn-sm ${showCreateForm ? 'active' : ''}`}
              onClick={() => setShowCreateForm(v => !v)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>

              {showCreateForm ? 'Hide Form' : 'New Employee'}
            </button>

            {/* EXPORT CONTROLS */}
            <div className="export-controls">

              <div className="export-mode" role="group" aria-label="Export range">
                <button
                  type="button"
                  className={`export-mode-btn ${exportAll ? 'active' : ''}`}
                  onClick={() => setExportAll(true)}
                >
                  All records
                </button>
                <button
                  type="button"
                  className={`export-mode-btn ${!exportAll ? 'active' : ''}`}
                  onClick={() => setExportAll(false)}
                >
                  Date range
                </button>
              </div>

              {!exportAll && (

                <div className="export-range">

                  <label className="export-month">
                    <span>From</span>
                    <input
                      type="month"
                      value={fromMonth}
                      onChange={e =>
                        setFromMonth(e.target.value)
                      }
                    />
                  </label>
                  <span className="export-range-arrow" aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14"/>
                      <path d="m15 8 4 4-4 4"/>
                    </svg>
                  </span>
                  <label className="export-month">
                    <span>To</span>
                    <input
                      type="month"
                      value={toMonth}
                      onChange={e =>
                        setToMonth(e.target.value)
                      }
                    />
                  </label>
                </div>
              )}
            </div>

            {/* EXPORT BUTTON */}
            <button
              className="btn btn-success btn-sm"
              onClick={handleExport}
              disabled={exportLoading || exportRangeInvalid}
              title={exportRangeInvalid ? 'Choose a valid month range' : undefined}
            >
              {exportLoading
                ? <>
                    <span className="btn-spinner" />
                    Exporting...
                  </>
                : <>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>

                    Export Excel
                  </>
              }
            </button>

          </div>
        </div>

        {/* Create Employee Section */}
        {showCreateForm && (
          <section className="card section-card">
            <div className="card-header">
              <div className="card-title-group">
                <span className="card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <h3 className="card-title">Create New Employee</h3>
              </div>
            </div>
            <CreateEmployeeForm
              onCreated={() => setEmployeeListRefreshKey(key => key + 1)}
            />
          </section>
        )}

        {/* Employee List Section */}
        <EmployeeList refreshKey={employeeListRefreshKey} />

        {/* Filter + Table Section */}
        <section className="card section-card">
          <div className="card-header">
            <div className="card-title-group">
              <span className="card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              </span>
              <h3 className="card-title">All Worklogs</h3>
              {activeFilterCount > 0 && (
                <span className="filter-active-badge">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
              )}
            </div>
            <span className="record-count">{logs.length} records</span>
          </div>

          <div className="filter-section">
            <FilterBar onFilter={handleFilter} loading={logsLoading} />
          </div>

          <AdminTable logs={logs} loading={logsLoading} />
        </section>
      </main>
    </div>
  )
}
