import { useContext } from 'react'
import { DensityContext } from '@/contexts/DensityContext.js'

export const useDensity = () => {
    const context = useContext(DensityContext)
    if (!context) throw new Error('useDensity deve ser usado dentro de DensityProvider')
    return context
}
