import { Header, StyledPanel, Subtitle, Title } from './Panel.styles.js'

export const Panel = ({ title, subtitle, action, padded = true, children }) => (
    <StyledPanel $padded={padded}>
        {title && (
            <Header $padded={padded}>
                <div>
                    <Title>{title}</Title>
                    {subtitle && <Subtitle>{subtitle}</Subtitle>}
                </div>
                {action}
            </Header>
        )}
        {children}
    </StyledPanel>
)
