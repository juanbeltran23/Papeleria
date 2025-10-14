import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../supabase/auth";

export default function ProtectedRoute({ children, allowedRole }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then(u => mounted && setUser(u ?? null))
      .catch(() => mounted && setUser(null));
    return () => { mounted = false; };
  }, []);

  if (user === undefined) return null;
  if (user === null) return <Navigate to="/" replace />;

  if (Number(user.idrol) !== Number(allowedRole)) return <Navigate to="/" replace />;

  return children;
}


