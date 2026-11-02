import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useState } from 'react'
import { MONTHS_FULL, WEEKDAYS } from '@/constants/calendar.js'
import { getTodayIso } from '@/utils/dateRange.js'
import {
    buildDateCells,
    isOutOfRange,
    parseValue,
    shiftMonth,
    toDateValue,
} from '@/utils/calendar.js'
import {
    DayCell,
    Footer,
    Grid,
    HeaderBand,
    NavButton,
    StyledCalendar,
    TodayButton,
    Title,
    WeekdayCell,
} from './Calendar.styles.js'

export const Calendar = ({ value, min, max, onSelect }) => {
    const selected = parseValue(value)
    const today = getTodayIso()
    const initial = selected ?? parseValue(today)
    const [view, setView] = useState({ year: initial.year, month: initial.month })

    const goTo = (delta) => setView((current) => shiftMonth(current.year, current.month, delta))
    const cells = buildDateCells(view.year, view.month)

    return (
        <StyledCalendar>
            <HeaderBand>
                <NavButton type="button" onClick={() => goTo(-1)} aria-label="Mês anterior">
                    <IconChevronLeft size={14} stroke={2} />
                </NavButton>
                <Title aria-live="polite">
                    {MONTHS_FULL[view.month - 1]} de {view.year}
                </Title>
                <NavButton type="button" onClick={() => goTo(1)} aria-label="Próximo mês">
                    <IconChevronRight size={14} stroke={2} />
                </NavButton>
            </HeaderBand>
            <Grid>
                {WEEKDAYS.map((weekday) => (
                    <WeekdayCell key={weekday}>{weekday}</WeekdayCell>
                ))}
                {cells.map((cell) => {
                    const dateValue = toDateValue(cell)
                    return (
                        <DayCell
                            key={dateValue}
                            type="button"
                            $isSelected={dateValue === value}
                            $isToday={dateValue === today}
                            $isOutside={!cell.current}
                            disabled={isOutOfRange(dateValue, min, max)}
                            onClick={() => onSelect(dateValue)}
                        >
                            {cell.day}
                        </DayCell>
                    )
                })}
            </Grid>
            <Footer>
                <TodayButton
                    type="button"
                    disabled={isOutOfRange(today, min, max)}
                    onClick={() => onSelect(today)}
                >
                    Hoje
                </TodayButton>
            </Footer>
        </StyledCalendar>
    )
}
