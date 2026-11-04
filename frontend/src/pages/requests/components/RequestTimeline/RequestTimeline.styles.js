import styled from 'styled-components'

export const StyledTimeline = styled.ol`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0;
    padding: 0 0 0 16px;
    border-left: 2px solid var(--color-border);
    list-style: none;
`

export const Event = styled.li`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 2px;

    &::before {
        content: '';
        position: absolute;
        top: 6px;
        left: -22px;
        width: 10px;
        height: 10px;
        border: 2px solid var(--color-surface);
        border-radius: 50%;
        background: var(--color-primary);
    }
`

export const EventTitle = styled.span`
    font-size: 14px;
    font-weight: 600;
`

export const Meta = styled.span`
    font-size: 12px;
    color: var(--color-text-muted);
`

export const Detail = styled.p`
    font-size: 14px;
`
