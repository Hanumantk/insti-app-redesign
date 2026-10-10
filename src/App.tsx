import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toast } from './components/Toast'
import { RoleSwitcher } from './components/RoleSwitcher'
import { LoadingPage, LoginPage } from './pages/AuthPages'
import { EventFormPage } from './pages/EventFormPage'
import { EventPage } from './pages/EventPage'
import { HomePage } from './pages/HomePage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/loading?next=/login" replace />} />
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/event/new" element={<EventFormPage />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/event/:id/edit" element={<EventFormPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <RoleSwitcher />
      <Toast />
    </BrowserRouter>
  )
}
