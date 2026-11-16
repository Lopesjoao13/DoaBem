import styled, { keyframes } from 'styled-components'
import { TONES } from '@/constants/tones.js'

const ROW_BACKGROUNDS = {
    [TONES.CRITICAL]: 'var(--red-50)',
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

export const Wrapper = styled.div`
    position: relative;
`

export const Scroll = styled.div`
    overflow-x: auto;
    opacity: ${({ $isRefreshing }) => ($isRefreshing ? 0.5 : 1)};
    pointer-events: ${({ $isRefreshing }) => ($isRefreshing ? 'none' : 'auto')};
    transition: opacity var(--duration-base) var(--ease-out);
`

export const Overlay = styled.div`
    position: absolute;
    inset: 0;
    z-index: 1;
    display: grid;
    place-items: center;
    color: var(--teal-500);

    svg {
        animation: ${spin} 1s linear infinite;
    }
`

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
`

export const HeaderCell = styled.th`
    padding: 14px 16px;
    border-bottom: 1px solid var(--color-border);
    background: var(--teal-500);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: var(--tracking-tight);
    text-align: center;
    text-transform: uppercase;
    white-space: nowrap;
    color: var(--white);

    &:first-child {
        padding-left: 32px;
    }

    &:last-child {
        padding-right: 32px;
    }
`

export const SortButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 0;
    border: none;
    background: transparent;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    color: var(--white);
    opacity: ${({ $isActive }) => ($isActive ? 1 : 0.85)};
    cursor: pointer;

    &:hover {
        opacity: 1;
    }
`

export const Row = styled.tr`
    background: ${({ $tone }) => ROW_BACKGROUNDS[$tone] ?? 'var(--color-surface)'};
    transition: background var(--duration-fast) var(--ease-out);

    &:nth-child(even) {
        background: ${({ $tone }) => ROW_BACKGROUNDS[$tone] ?? 'var(--gray-50)'};
    }

    &:hover {
        background: ${({ $tone }) => ROW_BACKGROUNDS[$tone] ?? 'var(--blue-50)'};
    }
`

export const Cell = styled.td`
    padding: var(--cell-padding-y) 16px;
    text-align: center;
    vertical-align: middle;
    white-space: ${({ $noWrap }) => ($noWrap ? 'nowrap' : 'normal')};

    &:first-child {
        padding-left: 32px;
    }

    &:last-child {
        padding-right: 32px;
    }
`
