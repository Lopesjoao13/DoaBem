import styled from 'styled-components'

export const Block = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`

export const Cards = styled.div`
    display: grid;
    grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
    gap: 16px;

    section {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    @media (max-width: 960px) {
        grid-template-columns: 1fr;
    }
`
