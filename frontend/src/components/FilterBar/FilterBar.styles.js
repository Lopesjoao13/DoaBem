import styled from 'styled-components'

export const Fields = styled.div`
    display: flex;
    flex: 1 1 100%;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 16px;
    min-width: 0;
`

export const Slot = styled.div`
    flex: ${({ $grow }) => ($grow ? '2 1 240px' : '1 1 180px')};
    min-width: 0;
`

export const ClearSlot = styled.div`
    display: flex;
    flex: none;
    height: var(--input-height);
    align-items: center;
`
