import styled from 'styled-components'

export const LinkButton = styled.button`
    align-self: flex-start;
    padding: 0;
    border: none;
    background: transparent;
    font: inherit;
    font-weight: 600;
    color: var(--color-primary);
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
`
