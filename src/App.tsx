import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage'
import TrainerPage from './pages/TrainerPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'

function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])

  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trainer" element={<TrainerPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
      </Routes>
    </>
  )
}

export default App
