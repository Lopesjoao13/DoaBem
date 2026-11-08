import { useContext } from 'react'
import { ThemeContext } from '@/contexts/ThemeContext.js'

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
    return context
}
