
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';

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

// Components
import { Layout } from './components/Layout';
import { AuthProvider } from './hooks/useAuth';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="crm-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="leads" element={<Leads />} />
                <Route path="opportunities" element={<Opportunities />} />
                <Route path="pipeline" element={<Pipeline />} />
                <Route path="inbox" element={<Inbox />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="meetings" element={<Meetings />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
