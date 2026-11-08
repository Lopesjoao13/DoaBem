import styled from 'styled-components'
import { CALENDAR_WIDTH_PX } from '@/constants/calendar.js'

export const StyledCalendar = styled.div`
    width: ${CALENDAR_WIDTH_PX}px;
    overflow: hidden;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    color: var(--color-fg);
    box-shadow: var(--shadow-modal);
`

export const HeaderBand = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    border-bottom: 1px solid var(--color-border);
    background: var(--gray-100);
`

export const Title = styled.span`
    font-size: 12px;
    font-weight: 600;

    &::first-letter {
        text-transform: uppercase;
    }
`

export const NavButton = styled.button`
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--teal-500);
    cursor: pointer;

    &:hover {
        background: var(--gray-200);
    }
`

export const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    padding: 8px;
`

export const WeekdayCell = styled.span`
    display: grid;
    place-items: center;
    height: 24px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color-fg-muted);
`

export const DayCell = styled.button`
    display: grid;
    place-items: center;
    height: 28px;
    padding: 0;
    border: 1px solid
        ${({ $isSelected, $isToday }) => {
            if ($isSelected) return 'var(--teal-500)'
            return $isToday ? 'var(--gray-400)' : 'transparent'
        }};
    border-radius: var(--radius);
    background: ${({ $isSelected }) => ($isSelected ? 'var(--teal-50)' : 'transparent')};
    color: ${({ $isSelected, $isOutside }) => {
        if ($isSelected) return 'var(--teal-500)'
        return $isOutside ? 'var(--gray-500)' : 'var(--color-fg)'
    }};
    font: inherit;
    font-size: 12px;
    font-weight: ${({ $isSelected }) => ($isSelected ? 700 : 400)};
    cursor: pointer;

    &:hover:not(:disabled) {
        background: ${({ $isSelected }) => ($isSelected ? 'var(--teal-50)' : 'var(--gray-100)')};
    }

    &:disabled {
        color: var(--gray-400);
        cursor: not-allowed;
    }
`

export const Footer = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 0 8px 4px;
`

export const TodayButton = styled.button`
    padding: 4px 8px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--teal-500);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &:hover:not(:disabled) {
        background: var(--gray-100);
    }

    &:disabled {
        color: var(--gray-400);
        cursor: not-allowed;
    }
`
