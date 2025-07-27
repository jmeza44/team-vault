import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AlertProvider } from '@/contexts/AlertContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CredentialsPage } from '@/pages/credentials/CredentialsPage'
import { TeamsPage } from '@/pages/teams/TeamsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import AlertContainer from '@/components/common/AlertContainer'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AlertProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="credentials" element={<CredentialsPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Alert container for global alerts */}
      <AlertContainer />
    </AlertProvider>
  </AuthProvider>
</ThemeProvider>
  )
}

export default App
