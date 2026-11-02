import styled from 'styled-components'

export const Shell = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`

export const Body = styled.div`
    display: grid;
    grid-template-columns: ${({ $isCollapsed }) =>
            $isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)'} 1fr;
    transition: grid-template-columns var(--duration-base) var(--ease-out);
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
    max-width: 1680px;
    margin: 0 auto;
`
