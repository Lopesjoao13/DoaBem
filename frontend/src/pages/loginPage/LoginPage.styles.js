import styled from 'styled-components'

export const Page = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 100vh;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`

export const FormSide = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    background: var(--color-bg);
`
