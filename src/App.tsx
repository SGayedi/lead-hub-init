
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { ThemeProvider } from "./components/ThemeProvider";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Leads from "./pages/Leads";
import Tasks from "./pages/Tasks";
import Meetings from "./pages/Meetings";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useOutlookAuth } from "./hooks/useOutlookAuth";
import { Toaster as SonnerToaster } from "./components/ui/sonner";
import "./App.css";
import Calendar from "./pages/Calendar";
import Opportunities from "./pages/Opportunities";
import Inbox from "./pages/Inbox";

const queryClient = new QueryClient();

function OutlookCallbackHandler() {
  useOutlookAuth();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="crm-theme">
        <Router>
          <AuthProvider>
            <OutlookCallbackHandler />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Index />} />
                <Route path="leads" element={<Leads />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="meetings" element={<Meetings />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="opportunities" element={<Opportunities />} />
                <Route path="inbox" element={<Inbox />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <SonnerToaster position="top-right" />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
