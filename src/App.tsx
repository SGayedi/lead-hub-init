
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import './App.css';

// Pages
import Index from "./pages/Index";
import Leads from "./pages/Leads";
import Enquiries from "./pages/Enquiries";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

// Components
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Create a QueryClient instance for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/leads" element={
            <ProtectedRoute>
              <Layout><Leads /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/enquiries" element={
            <ProtectedRoute>
              <Layout><Enquiries /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout><Settings /></Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
