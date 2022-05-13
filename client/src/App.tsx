import { Route, Routes, Navigate } from 'react-router-dom'

import ErrorPage from 'pages/ErrorPage'
import LandingPage from 'pages/LandingPage'
import ResourcePage from 'pages/ResourcePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/anime/:malId" element={<ResourcePage malType="anime" />} />
      <Route path="/manga/:malId" element={<ResourcePage malType="manga" />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<Navigate to="/error" replace />} />
    </Routes>
  )
}

export default App
