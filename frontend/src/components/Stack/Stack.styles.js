import styled from 'styled-components'

export const StyledStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ $gap }) => `${$gap}px`};
`
