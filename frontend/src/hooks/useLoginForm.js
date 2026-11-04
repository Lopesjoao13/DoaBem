import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes.js'
import { useAuth } from '@/hooks/useAuth.js'
import { login } from '@/services/authService.js'
import { validateLogin } from '@/utils/validateLogin.js'

export const useLoginForm = () => {
    const navigate = useNavigate()
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [formError, setFormError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
    }

    const handlePasswordChange = (event) => {
        setPassword(event.target.value)
    }

    const submitLogin = async (event) => {
        event.preventDefault()

        const errors = validateLogin(email, password)
        setFieldErrors(errors)
        setFormError('')

        if (Object.keys(errors).length > 0) return

        setIsLoading(true)
        try {
            const session = await login(email, password)
            signIn(session)
            navigate(ROUTES.DASHBOARD, { replace: true })
        } catch (error) {
            console.error('Falha no login:', error.message)
            setFormError(error.message)
            setIsLoading(false)
        }
    }

    return {
        email,
        password,
        fieldErrors,
        formError,
        isLoading,
        handleEmailChange,
        handlePasswordChange,
        submitLogin,
    }
}
