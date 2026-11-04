import { generatePath } from 'react-router-dom'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import { ROUTES } from '@/constants/routes.js'

export const MovementReference = ({ reference }) => {
    if (reference.entryId) {
        return (
            <TextLink to={generatePath(ROUTES.ENTRY_DETAIL, { id: reference.entryId })}>
                {reference.label}
            </TextLink>
        )
    }
    if (reference.requestId) {
        return (
            <TextLink to={generatePath(ROUTES.REQUEST_DETAIL, { id: reference.requestId })}>
                {reference.label}
            </TextLink>
        )
    }
    return reference.label
}
