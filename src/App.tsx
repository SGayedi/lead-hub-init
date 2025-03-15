
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Pages
import Index from './pages/Index';
import Leads from './pages/Leads';
import Opportunities from './pages/Opportunities';
import Pipeline from './pages/Pipeline';
import Inbox from './pages/Inbox';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import Meetings from './pages/Meetings';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';

// Admin Pages
import AdminAuth from './pages/admin/AdminAuth';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemSettings from './pages/admin/SystemSettings';
import EmailTemplates from './pages/admin/EmailTemplates';
import DataManagement from './pages/admin/DataManagement';

// Components
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { AuthProvider } from './hooks/useAuth';
import { AdminAuthProvider } from './hooks/useAdminAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="crm-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <AdminAuthProvider>
              <Routes>
                {/* CRM Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="leads" element={
                    <ProtectedRoute>
                      <Leads />
                    </ProtectedRoute>
                  } />
                  <Route path="opportunities" element={
                    <ProtectedRoute>
                      <Opportunities />
                    </ProtectedRoute>
                  } />
                  <Route path="pipeline" element={
                    <ProtectedRoute>
                      <Pipeline />
                    </ProtectedRoute>
                  } />
                  <Route path="inbox" element={
                    <ProtectedRoute>
                      <Inbox />
                    </ProtectedRoute>
                  } />
                  <Route path="calendar" element={
                    <ProtectedRoute>
                      <Calendar />
                    </ProtectedRoute>
                  } />
                  <Route path="tasks" element={
                    <ProtectedRoute>
                      <Tasks />
                    </ProtectedRoute>
                  } />
                  <Route path="meetings" element={
                    <ProtectedRoute>
                      <Meetings />
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/auth" element={<Auth />} />
                
                {/* Admin Routes */}
                <Route path="/admin/auth" element={<AdminAuth />} />
                <Route path="/admin" element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="settings" element={<SystemSettings />} />
                  <Route path="emails" element={<EmailTemplates />} />
                  <Route path="data" element={<DataManagement />} />
                </Route>
              </Routes>
              <Toaster />
            </AdminAuthProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
