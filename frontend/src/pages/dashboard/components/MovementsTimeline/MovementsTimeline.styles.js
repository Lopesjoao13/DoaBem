import styled from 'styled-components'

export const Day = styled.section`
    display: flex;
    flex-direction: column;
    gap: 8px;

    & + & {
        margin-top: 24px;
    }
`

export const DayTitle = styled.h3`
    font-size: 12px;
    font-weight: 700;
    letter-spacing: var(--tracking-tight);
    text-transform: uppercase;
    color: var(--color-fg-muted);
`

export const Entries = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`

export const Entry = styled.li`
    display: grid;
    grid-template-columns: 48px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 8px 0;

    &:not(:last-child) {
        border-bottom: 1px solid var(--color-border);
    }
`

export const Time = styled.span`
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--color-fg-muted);
`

export const Name = styled.p`
    font-size: 14px;
    font-weight: 600;
`

export const Description = styled.p`
    font-size: 12px;
    color: var(--color-fg-muted);
`
