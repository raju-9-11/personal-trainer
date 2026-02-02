import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTheme } from './components/ThemeContext'
import { BootLoader } from './components/ui/boot-loader'
import { AnimatePresence } from 'framer-motion'
import { Lock, Sun, Moon } from 'lucide-react'
import { Button } from './components/ui/button'
import HomePage from './pages/HomePage'
import TrainerPage from './pages/TrainerPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import MockPaymentPage from './pages/MockPaymentPage'
import NotFoundPage from './pages/NotFoundPage'

function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])

  return null
}

function App() {
  const [booting, setBooting] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <>
      <AnimatePresence>
        {booting && <BootLoader />}
      </AnimatePresence>
      {!booting && (
        <>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/t/:slug" element={<TrainerPage />} />
            <Route path="/trainer" element={<TrainerPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/payment" element={<MockPaymentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </>
      )}
    </>
  )
}

export default App
