import { IconArrowRight } from '@tabler/icons-react'
import { Button } from '@/components/Button/Button.jsx'
import { FormField } from '@/components/FormField/FormField.jsx'
import { useLoginForm } from '@/hooks/useLoginForm.js'
import {
    Container,
    Eyebrow,
    ErrorMessage,
    Footer,
    Form,
    Subtitle,
    Title,
} from './LoginForm.styles.js'

export const LoginForm = () => {
    const {
        email,
        password,
        fieldErrors,
        formError,
        isLoading,
        handleEmailChange,
        handlePasswordChange,
        submitLogin,
    } = useLoginForm()

    return (
        <Container>
            <Eyebrow>Bem-vindo de volta</Eyebrow>
            <Title>Acesse sua conta</Title>
            <Subtitle>Entre com suas credenciais institucionais.</Subtitle>

            <Form onSubmit={submitLogin} noValidate>
                <FormField
                    label="E-mail"
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    error={fieldErrors.email}
                    autoComplete="username"
                    autoFocus
                />

                <FormField
                    label="Senha"
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    error={fieldErrors.password}
                    autoComplete="current-password"
                />

                {formError && <ErrorMessage role="alert">{formError}</ErrorMessage>}

                <Button type="submit" family="main" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                    {!isLoading && <IconArrowRight size={16} stroke={2} />}
                </Button>
            </Form>

            <Footer>Uso interno. Não há cadastro público.</Footer>
        </Container>
    )
}
