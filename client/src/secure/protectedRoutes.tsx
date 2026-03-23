import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store'

export function ProtectedRoutes() {
    const isAuthenticated = !!useAuthStore((s) => s.authToken);

    if (!isAuthenticated) {
        return <Navigate to="/Login" replace/>
    }

    return <Outlet/>
}