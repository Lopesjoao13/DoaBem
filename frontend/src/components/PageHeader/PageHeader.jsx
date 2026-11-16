import { Actions, Description, StyledPageHeader, Title } from './PageHeader.styles.js'

export const PageHeader = ({ title, description, actions }) => (
    <StyledPageHeader>
        <div>
            <Title>{title}</Title>
            {description && <Description>{description}</Description>}
        </div>
        {actions && <Actions>{actions}</Actions>}
    </StyledPageHeader>
)
