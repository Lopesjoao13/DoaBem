import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { AuthProvider } from '@/contexts/AuthProvider.jsx'
import { ToastProvider } from '@/contexts/ToastProvider.jsx'
import { AppRoutes } from '@/routes/AppRoutes.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ToastProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </ToastProvider>
    </StrictMode>,
)
