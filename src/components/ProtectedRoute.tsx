import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { checkAdminAuth, onAdminAuthStateChange, AdminProfile } from "@/lib/adminAuthUtils";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check initial auth state
    checkAdminAuth().then(({ isAdmin, profile }) => {
      setIsAdmin(isAdmin);
      setProfile(profile);
      setLoading(false);
    });

    // Listen to auth state changes
    const { data: { subscription } } = onAdminAuthStateChange((isAdmin, profile) => {
      setIsAdmin(isAdmin);
      setProfile(profile);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated or not admin
  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
}
