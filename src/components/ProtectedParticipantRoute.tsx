import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkParticipantAuth } from "@/lib/participantAuth";

export function ProtectedParticipantRoute({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkParticipantAuth().then(({ isAuthenticated }) => {
      setIsAuthenticated(isAuthenticated);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/participant/login" replace />;
  }

  return <>{children}</>;
}
