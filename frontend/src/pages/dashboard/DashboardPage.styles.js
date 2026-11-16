import styled from 'styled-components'

export const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    opacity: ${({ $isRefreshing }) => ($isRefreshing ? 0.6 : 1)};
    transition: opacity var(--duration-base) var(--ease-out);
`

export const Charts = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;

    @media (min-width: 1200px) {
        grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
    }
`

export const Lists = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 24px;

    @media (min-width: 1200px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
`
