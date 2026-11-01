import { Description, Header, StyledFormSection, Title } from './FormSection.styles.js'

export const FormSection = ({ title, subtitle, action, children }) => (
    <StyledFormSection>
        <Header>
            <div>
                <Title>{title}</Title>
                {subtitle && <Description>{subtitle}</Description>}
            </div>
            {action}
        </Header>
        {children}
    </StyledFormSection>
)
