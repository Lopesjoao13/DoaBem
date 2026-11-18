import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
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
    const loginMutation = useMutation({
        mutationFn: ({ email: userEmail, password: userPassword }) =>
            login(userEmail, userPassword),
    })

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

        try {
            const session = await loginMutation.mutateAsync({ email, password })
            signIn(session)
            navigate(ROUTES.DASHBOARD, { replace: true })
        } catch (error) {
            console.error('Falha no login:', error.message)
            setFormError(error.message)
        }
    }

    return {
        email,
        password,
        fieldErrors,
        formError,
        isLoading: loginMutation.isPending || loginMutation.isSuccess,
        handleEmailChange,
        handlePasswordChange,
        submitLogin,
    }
}
