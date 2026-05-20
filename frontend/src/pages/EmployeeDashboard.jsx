import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import WorklogForm from '../components/WorklogForm.jsx'
import WorklogTable from '../components/WorklogTable.jsx'
import { getMyWorklogs, getTodayWorklog, createWorklog, updateWorklog } from '../services/api'
import ChangePassword from '../components/Changepassword.jsx'

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

export default function EmployeeDashboard() {
  const token = localStorage.getItem('token')
  const user = parseJwt(token)
  console.log("Dashboard loaded");
  console.log(user);  
  const [todayLog, setTodayLog] = useState(null)
  const [allLogs, setAllLogs] = useState([])
  const [formLoading, setFormLoading] = useState(false)
  const [logsLoading, setLogsLoading] = useState(true)
  const [todayLoading, setTodayLoading] = useState(true)
  const [submitMsg, setSubmitMsg] = useState({ type: '', text: '' })
  const [showChangePwd, setShowChangePwd] = useState(false)

  if (!user) return <div>Loading...</div>;

  const loadTodayLog = async () => {
    setTodayLoading(true)
    try {
      const res = await getTodayWorklog()
      setTodayLog(res.data || null)
    } catch {
      setTodayLog(null)
    } finally {
      setTodayLoading(false)
    }
  }

  const loadAllLogs = async () => {
    setLogsLoading(true)
    try {
      const res = await getMyWorklogs()
      setAllLogs(res.data || [])
    } catch {
      setAllLogs([])
    } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => {
    loadTodayLog()
    loadAllLogs()
  }, [])

  const handleSubmit = async (data) => {
    setFormLoading(true)
    setSubmitMsg({ type: '', text: '' })
    try {
      if (todayLog?.id) {
        await updateWorklog(todayLog.id, data)
        setSubmitMsg({ type: 'success', text: "Today's worklog updated successfully!" })
      } else {
        await createWorklog(data)
        setSubmitMsg({ type: 'success', text: "Worklog submitted for today!" })
      }
      await loadTodayLog()
      await loadAllLogs()
    } catch (err) {
      setSubmitMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save worklog.'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    
    <div className="page-wrapper">
      <Navbar userName={user?.name || user?.employee_code} role="employee" />

      {showChangePwd && (
        <ChangePassword onClose={() => setShowChangePwd(false)} />
      )}

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">My Dashboard</h2>
            <p className="page-subtitle">{today}</p>
          </div>
          <div className="page-header-meta">
            <span className="emp-code-tag">{user?.employee_code}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowChangePwd(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Change Password
            </button>
          </div>
        </div>

        {/* Today's Worklog Section */}
        <section className="card section-card">
          <div className="card-header">
            <div className="card-title-group">
              <span className="card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </span>
              <h3 className="card-title">
                {todayLoading ? "Today's Worklog" : todayLog ? "Update Today's Worklog" : "Submit Today's Worklog"}
              </h3>
            </div>
            {todayLog && (
              <span className="badge badge-submitted">Submitted</span>
            )}
          </div>

          {todayLoading ? (
            <div className="form-loading">
              <div className="loading-spinner" />
              <span>Loading today's entry...</span>
            </div>
          ) : (
            <>
              {submitMsg.text && (
                <div className={`alert alert-${submitMsg.type}`}>{submitMsg.text}</div>
              )}
              <WorklogForm
                existing={todayLog}
                onSubmit={handleSubmit}
                loading={formLoading}
              />
            </>
          )}
        </section>

        {/* History Section */}
        <section className="card section-card">
          <div className="card-header">
            <div className="card-title-group">
              <span className="card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </span>
              <h3 className="card-title">Worklog History</h3>
            </div>
            <span className="record-count">{allLogs.length} records</span>
          </div>
          <WorklogTable logs={allLogs} loading={logsLoading} />
        </section>
      </main>
    </div>
  )
  
}