import styled from 'styled-components'

export const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: 8px;

    & + & {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid var(--color-border);
    }
`

export const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
`

export const SectionTitle = styled.h3`
    font-size: 12px;
    font-weight: 700;
    letter-spacing: var(--tracking-tight);
    text-transform: uppercase;
    color: var(--color-fg-muted);
`

export const List = styled.ul`
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
`

export const ListItem = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 0;

    &:not(:last-child) {
        border-bottom: 1px solid var(--color-border);
    }
`

export const Strong = styled.p`
    font-size: 14px;
    font-weight: 600;
`

export const Description = styled.p`
    font-size: 12px;
    color: var(--color-fg-muted);
`

export const Actions = styled.div`
    display: flex;
    flex: none;
    gap: 4px;
`
