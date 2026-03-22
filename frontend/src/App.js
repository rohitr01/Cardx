import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

// Pages
import { HomePage } from "@/pages/HomePage";
import { CardsPage } from "@/pages/CardsPage";
import { CardDetailsPage } from "@/pages/CardDetailsPage";
import { ComparePage } from "@/pages/ComparePage";
import { AIRecommendPage } from "@/pages/AIRecommendPage";
import { InsightsPage } from "@/pages/InsightsPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { SignInPage } from "@/pages/SignInPage";

// Admin Pages
import { AdminLoginPage } from "@/admin/AdminLoginPage";
import { AdminDashboard } from "@/admin/AdminDashboard";
import { AdminCardsPage } from "@/admin/AdminCardsPage";
import { AdminCardForm } from "@/admin/AdminCardForm";
import { AdminLeadsPage } from "@/admin/AdminLeadsPage";
import { AdminReviewsPage } from "@/admin/AdminReviewsPage";

// Protected Route Wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Public Layout (with Navbar)
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/cards" element={<PublicLayout><CardsPage /></PublicLayout>} />
        <Route path="/cards/:id" element={<PublicLayout><CardDetailsPage /></PublicLayout>} />
        <Route path="/compare" element={<PublicLayout><ComparePage /></PublicLayout>} />
        <Route path="/recommend" element={<PublicLayout><AIRecommendPage /></PublicLayout>} />
        <Route path="/insights" element={<PublicLayout><InsightsPage /></PublicLayout>} />
        
        {/* Auth Routes */}
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/cards" 
          element={
            <ProtectedRoute adminOnly>
              <AdminCardsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/cards/new" 
          element={
            <ProtectedRoute adminOnly>
              <AdminCardForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/cards/edit/:id" 
          element={
            <ProtectedRoute adminOnly>
              <AdminCardForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/leads" 
          element={
            <ProtectedRoute adminOnly>
              <AdminLeadsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reviews" 
          element={
            <ProtectedRoute adminOnly>
              <AdminReviewsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;
