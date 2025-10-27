import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return null; // or a loading spinner
    }
    if (!user) {
        return <Navigate to="/" replace state={{ from: location}} />;
    }
    return children;
}