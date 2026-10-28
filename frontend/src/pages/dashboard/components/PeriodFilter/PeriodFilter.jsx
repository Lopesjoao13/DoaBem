import { Button } from '@/components/Button/Button.jsx'
import { DateInput, DateLabel, StyledPeriodFilter } from './PeriodFilter.styles.js'

export const PeriodFilter = ({ period, isLoading, onFromChange, onToChange, onReset }) => (
    <StyledPeriodFilter role="group" aria-label="Período das entradas e entregas">
        <DateLabel>
            De
            <DateInput
                type="date"
                value={period.from}
                max={period.to}
                onChange={onFromChange}
                disabled={isLoading}
                required
            />
        </DateLabel>
        <DateLabel>
            Até
            <DateInput
                type="date"
                value={period.to}
                min={period.from}
                onChange={onToChange}
                disabled={isLoading}
                required
            />
        </DateLabel>
        <Button variant="text" onClick={onReset} disabled={isLoading}>
            Últimos 30 dias
        </Button>
    </StyledPeriodFilter>
)
