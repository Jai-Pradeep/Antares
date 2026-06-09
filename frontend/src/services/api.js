import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = token
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

// Auth
export const login = (employee_code, password) =>
  api.post('/auth/login', { employee_code, password })
export const changePassword = data =>
  api.put('/auth/change-password', data)

// Employee
export const getMyWorklogs = () => api.get('/worklogs/my')
export const getTodayWorklog = () => api.get('/worklogs/today')
export const createWorklog = data => api.post('/worklogs', data)
export const updateWorklog = (id, data) => api.put(`/worklogs/${id}`, data)

// Admin
export const getAllWorklogs = (params) => api.get('/admin/worklogs', { params })
export const createEmployee = data => api.post('/admin/create-user', data)
export const exportWorklogs = (params) =>
  api.get('/admin/export', { params, responseType: 'blob' })
export const getEmployees = () =>
  api.get('/admin/employees')
export const resetPassword = (
  employee_code,
  newPassword
) =>
  api.put(
    `/admin/reset-password/${employee_code}`,
    { newPassword }
  )

export const deleteEmployee = (employee_code) =>
  api.delete(`/admin/employee/${employee_code}`);

export default api