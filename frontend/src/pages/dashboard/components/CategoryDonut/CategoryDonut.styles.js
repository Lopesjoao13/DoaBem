import styled from 'styled-components'

export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
`

export const Center = styled.div`
    position: relative;
    display: grid;
    place-items: center;
    width: 180px;
    height: 180px;
`

export const Ring = styled.svg`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
`

export const CenterValue = styled.span`
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
`

export const CenterText = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
`

export const CenterLabel = styled.span`
    font-size: 12px;
    color: var(--color-fg-muted);
`

export const Legend = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
`

export const LegendRow = styled.li`
    display: grid;
    grid-template-columns: 12px 1fr auto 40px;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-variant-numeric: tabular-nums;

    > :last-child {
        text-align: right;
        color: var(--color-fg-muted);
    }
`

export const Swatch = styled.span`
    width: 12px;
    height: 12px;
    border-radius: var(--radius-xs);
    background: ${({ $color }) => $color};
`
