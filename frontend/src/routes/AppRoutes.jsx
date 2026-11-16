import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout/AppLayout.jsx'
import { FEATURES } from '@/constants/features.js'
import { PERMISSIONS } from '@/constants/permissions.js'
import { ROUTES } from '@/constants/routes.js'
import DashboardPage from '@/pages/dashboard/DashboardPage.jsx'
import EntriesPage from '@/pages/entries/EntriesPage.jsx'
import FamiliesPage from '@/pages/families/FamiliesPage.jsx'
import ItemsPage from '@/pages/items/ItemsPage.jsx'
import LoginPage from '@/pages/login/LoginPage.jsx'
import MovementsPage from '@/pages/movements/MovementsPage.jsx'
import RequestsPage from '@/pages/requests/RequestsPage.jsx'
import StockPage from '@/pages/stock/StockPage.jsx'
import UsersPage from '@/pages/users/UsersPage.jsx'
import { FeatureRoute } from './FeatureRoute.jsx'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { PublicRoute } from './PublicRoute.jsx'
import { RoleRoute } from './RoleRoute.jsx'

export const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            <Route element={<PublicRoute />}>
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route element={<FeatureRoute isEnabled={FEATURES.DASHBOARD} />}>
                        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                    </Route>
                    <Route element={<FeatureRoute isEnabled={FEATURES.STOCK} />}>
                        <Route path={ROUTES.STOCK} element={<StockPage />} />
                    </Route>
                    <Route element={<FeatureRoute isEnabled={FEATURES.REQUESTS} />}>
                        <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
                    </Route>
                    <Route element={<FeatureRoute isEnabled={FEATURES.MOVEMENTS} />}>
                        <Route path={ROUTES.MOVEMENTS} element={<MovementsPage />} />
                    </Route>
                    <Route path={ROUTES.ENTRIES} element={<EntriesPage />} />
                    <Route path={ROUTES.FAMILIES} element={<FamiliesPage />} />
                    <Route path={ROUTES.ITEMS} element={<ItemsPage />} />
                    <Route element={<RoleRoute allowedRoles={PERMISSIONS.MANAGE_USERS} />}>
                        <Route path={ROUTES.USERS} element={<UsersPage />} />
                    </Route>
                </Route>
            </Route>
            <Route path={ROUTES.FALLBACK} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
    </BrowserRouter>
)
