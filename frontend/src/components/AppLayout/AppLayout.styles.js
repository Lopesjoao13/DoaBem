import styled from 'styled-components'

export const Shell = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`

export const Body = styled.div`
    display: grid;
    grid-template-columns: var(--sidebar-width) 1fr;
    flex: 1;
`

export const Main = styled.main`
    min-width: 0;
    padding: 32px;
`

export const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 1120px;
    margin: 0 auto;
`
