import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />

  const decoded = parseJwt(token)
  if (!decoded) return <Navigate to="/login" replace />

  if (requiredRole && decoded.role !== requiredRole) {
    return decoded.role === 'admin'
      ? <Navigate to="/admin" replace />
      : <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setInitialRoute('/login')
      return
    }
    const decoded = parseJwt(token)
    if (!decoded) {
      localStorage.removeItem('token')
      setInitialRoute('/login')
      return
    }
    setInitialRoute(decoded.role === 'admin' ? '/admin' : '/dashboard')
  }, [])

  if (!initialRoute) return (
    <div className="app-loading">
      <div className="loading-spinner" />
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={initialRoute} replace />} />
    </Routes>
  )
}
