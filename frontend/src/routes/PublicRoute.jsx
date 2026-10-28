import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.js'
import { useAuth } from '@/hooks/useAuth.js'

export const PublicRoute = () => {
    const { isAuthenticated } = useAuth()
    return isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <Outlet />
}
