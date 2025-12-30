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
  const [booting, setBooting] = useState(true)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  useEffect(() => {
    // Simulate enterprise-level boot sequence
    const timer = setTimeout(() => {
      setBooting(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

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
            <Route path="/trainer" element={<TrainerPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/payment" element={<MockPaymentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          
          {!isAdminPage && (
            <>
              <div className="fixed top-4 right-4 z-50">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm hover:bg-accent transition-all duration-300"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-700" />
                  )}
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}

export default App
