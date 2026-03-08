import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HomePage } from "@/pages/HomePage";
import { CardsPage } from "@/pages/CardsPage";
import { CardDetailsPage } from "@/pages/CardDetailsPage";
import { ComparePage } from "@/pages/ComparePage";
import { AIRecommendPage } from "@/pages/AIRecommendPage";
import { InsightsPage } from "@/pages/InsightsPage";
import { AdminLoginPage } from "@/admin/AdminLoginPage";
import { AdminDashboard } from "@/admin/AdminDashboard";
import { AdminCardForm } from "@/admin/AdminCardForm";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navbar /><HomePage /></>} />
            <Route path="/cards" element={<><Navbar /><CardsPage /></>} />
            <Route path="/cards/:id" element={<><Navbar /><CardDetailsPage /></>} />
            <Route path="/compare" element={<><Navbar /><ComparePage /></>} />
            <Route path="/ai-recommend" element={<><Navbar /><AIRecommendPage /></>} />
            <Route path="/insights" element={<><Navbar /><InsightsPage /></>} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/cards/new" 
              element={
                <ProtectedRoute>
                  <AdminCardForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/cards/edit/:id" 
              element={
                <ProtectedRoute>
                  <AdminCardForm />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;