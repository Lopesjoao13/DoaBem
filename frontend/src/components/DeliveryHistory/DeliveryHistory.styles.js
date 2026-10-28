import styled from 'styled-components'

export const List = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
`

export const DeliveryItem = styled.li`
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 14px;
`

export const DeliveryMeta = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;

    span {
        color: var(--color-text-muted);
    }
`

export const Items = styled.span`
    color: var(--color-text-muted);
`
