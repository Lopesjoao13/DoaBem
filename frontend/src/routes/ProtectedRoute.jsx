import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.js'
import { useAuth } from '@/hooks/useAuth.js'

export const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth()
    return isAuthenticated ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />
}
