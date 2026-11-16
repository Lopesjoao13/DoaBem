import { IconArrowRight } from '@tabler/icons-react'
import { Button } from '@/components/Button/Button.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { Input } from '@/components/Input/Input.jsx'
import { useLoginForm } from '@/pages/login/hooks/useLoginForm.js'
import { getDescribedBy } from '@/utils/a11y.js'
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
                <Field label="E-mail" htmlFor="email" error={fieldErrors.email}>
                    <Input
                        id="email"
                        error={fieldErrors.email}
                        aria-describedby={getDescribedBy('email', { error: fieldErrors.email })}
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        autoComplete="username"
                        autoFocus
                    />
                </Field>

                <Field label="Senha" htmlFor="password" error={fieldErrors.password}>
                    <Input
                        id="password"
                        error={fieldErrors.password}
                        aria-describedby={getDescribedBy('password', {
                            error: fieldErrors.password,
                        })}
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        autoComplete="current-password"
                    />
                </Field>

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
