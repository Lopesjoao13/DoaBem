import styled from 'styled-components'

export const AttentionGrid = styled.section`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    @media (max-width: 720px) {
        grid-template-columns: 1fr;
    }
`

export const VolumeGrid = styled.section`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    @media (max-width: 960px) {
        grid-template-columns: 1fr;
    }
`
