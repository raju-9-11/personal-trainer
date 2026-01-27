import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { BootLoader } from './components/ui/boot-loader'
import { AnimatePresence } from 'framer-motion'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const TrainerPage = lazy(() => import('./pages/TrainerPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const MockPaymentPage = lazy(() => import('./pages/MockPaymentPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])

  return null
}

function App() {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Suspense fallback={<BootLoader message="Loading..." />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/t/:slug" element={<TrainerPage />} />
            <Route path="/trainer" element={<TrainerPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/payment" element={<MockPaymentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  )
}

export default App
