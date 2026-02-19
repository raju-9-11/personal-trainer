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
import React, { Suspense } from 'react'

const TherapistPage = React.lazy(() => import('./pages/TherapistPage'))
const TherapyLandingPage = React.lazy(() => import('./pages/TherapyLandingPage'))
const TherapyAuth = React.lazy(() => import('./pages/TherapyAuth'))
const AnonymousChat = React.lazy(() => import('./components/therapist/AnonymousChat'))
const ProfilePage = React.lazy(() => import('./pages/profile/ProfilePage'))

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
            <Route path="/t/:slug" element={<TrainerPage />} />
            <Route path="/trainer" element={<TrainerPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/payment" element={<MockPaymentPage />} />
            
            {/* Therapy Routes */}
            <Route path="/therapy" element={
              <Suspense fallback={<BootLoader />}>
                <TherapyLandingPage />
              </Suspense>
            } />
            <Route path="/therapy/auth" element={
              <Suspense fallback={<BootLoader />}>
                <TherapyAuth />
              </Suspense>
            } />
             <Route path="/therapy/chat" element={
              <Suspense fallback={<BootLoader />}>
                <AnonymousChat />
              </Suspense>
            } />
            <Route path="/therapy/session" element={
              <Suspense fallback={<BootLoader />}>
                <TherapistPage />
              </Suspense>
            } />
            
            {/* Legacy Redirect or Alias */}
            <Route path="/therapist" element={<TherapistPage />} />
            
            <Route path="/profile" element={
              <Suspense fallback={<BootLoader />}>
                <ProfilePage />
              </Suspense>
            } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </>
      )}
    </>
  )
}

export default App
