import { BrandPanel } from '@/pages/login/components/BrandPanel/BrandPanel.jsx'
import { LoginForm } from '@/pages/login/components/LoginForm/LoginForm.jsx'
import { FormSide, Page } from './LoginPage.styles.js'

const LoginPage = () => (
    <Page>
        <BrandPanel />
        <FormSide>
            <LoginForm />
        </FormSide>
    </Page>
)

export default LoginPage
