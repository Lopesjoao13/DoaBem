import { TextLink } from '@/components/TextLink/TextLink.jsx'
import { buildEntryLink, buildRequestLink } from '@/utils/links.js'

export const MovementReference = ({ reference }) => {
    if (reference.entryId) {
        return <TextLink to={buildEntryLink(reference.entryId)}>{reference.label}</TextLink>
    }
    if (reference.requestId) {
        return <TextLink to={buildRequestLink(reference.requestId)}>{reference.label}</TextLink>
    }
    return reference.label
}
