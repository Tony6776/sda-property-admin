import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Admin routes only
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const PropertyNew = lazy(() => import("./pages/admin/PropertyNew"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/sda-property-admin">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Redirect root to admin login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin routes */}
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/properties/new" element={
              <ProtectedRoute>
                <PropertyNew />
              </ProtectedRoute>
            } />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
