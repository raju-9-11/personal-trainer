import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { BootLoader } from './components/ui/boot-loader'

// Lazy load pages to improve initial bundle size
const HomePage = lazy(() => import('./pages/HomePage'))
const TrainerPage = lazy(() => import('./pages/TrainerPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const LoginPage = lazy(() => import('./pages/admin/LoginPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const MockPaymentPage = lazy(() => import('./pages/MockPaymentPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

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
      <Suspense fallback={<BootLoader />}>
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
      </Suspense>
    </>
  )
}

export default App
