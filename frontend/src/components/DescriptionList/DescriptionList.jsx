import { Detail, StyledDescriptionList, Term } from './DescriptionList.styles.js'

export const DescriptionList = ({ items }) => (
    <StyledDescriptionList>
        {items.map(({ label, value }) => (
            <div key={label}>
                <Term>{label}</Term>
                <Detail>{value || '—'}</Detail>
            </div>
        ))}
    </StyledDescriptionList>
)
