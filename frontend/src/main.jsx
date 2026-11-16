import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { AuthProvider } from '@/contexts/AuthProvider.jsx'
import { DensityProvider } from '@/contexts/DensityProvider.jsx'
import { ThemeProvider } from '@/contexts/ThemeProvider.jsx'
import { ToastProvider } from '@/contexts/ToastProvider.jsx'
import { AppRoutes } from '@/routes/AppRoutes.jsx'
import { applyDensity, loadDensity } from '@/utils/density.js'
import { applyTheme, loadThemePreference } from '@/utils/theme.js'

applyTheme(loadThemePreference())
applyDensity(loadDensity())

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider>
            <DensityProvider>
                <ToastProvider>
                    <AuthProvider>
                        <AppRoutes />
                    </AuthProvider>
                </ToastProvider>
            </DensityProvider>
        </ThemeProvider>
    </StrictMode>,
)
