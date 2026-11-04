import styled from 'styled-components'

export const Columns = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(280px, 2fr);
    align-items: start;
    gap: 24px;

    @media (max-width: 960px) {
        grid-template-columns: 1fr;
    }
`

export const Side = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`
