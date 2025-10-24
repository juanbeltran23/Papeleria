// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../supabase/auth";

export default function ProtectedRoute({ allowedRole, children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Cargando...
      </div>
    );

  if (!user) return <Navigate to="/" replace />;

  const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  if (!roles.includes(String(user.idRol))) return <Navigate to="/" replace />;

  return children;
}
