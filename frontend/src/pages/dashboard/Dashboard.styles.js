import styled from 'styled-components'

export const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    opacity: ${({ $isRefreshing }) => ($isRefreshing ? 0.6 : 1)};
    transition: opacity 160ms ease-out;
`

export const Charts = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;

    @media (min-width: 1200px) {
        grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
    }
`

export const Lists = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    align-items: start;
    gap: 24px;

    @media (min-width: 1200px) {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
    }
`
