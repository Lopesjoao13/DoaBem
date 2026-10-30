import { IconArrowLeft } from '@tabler/icons-react'
import { TextLink } from '@/components/TextLink/TextLink.jsx'

export const BackLink = ({ to, children }) => (
    <TextLink to={to}>
        <IconArrowLeft size={16} stroke={2} />
        {children}
    </TextLink>
)
