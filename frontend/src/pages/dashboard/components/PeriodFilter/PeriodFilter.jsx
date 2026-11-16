import { IconRefresh } from '@tabler/icons-react'
import { DateField } from '@/components/DateField/DateField.jsx'
import { IconButton } from '@/components/IconButton/IconButton.jsx'
import { SegmentedControl } from '@/components/SegmentedControl/SegmentedControl.jsx'
import { CUSTOM_PERIOD, PERIOD_PRESETS } from '@/pages/dashboard/constants/dashboard.js'
import { formatTime } from '@/utils/formatters.js'
import { DateLabel, FieldSlot, StyledPeriodFilter, Updated } from './PeriodFilter.styles.js'

export const PeriodFilter = ({
    period,
    preset,
    generatedAt,
    isLoading,
    onPresetChange,
    onFromChange,
    onToChange,
    onRefresh,
}) => (
    <StyledPeriodFilter role="group" aria-label="Período das entradas e entregas">
        <SegmentedControl
            label="Período"
            options={PERIOD_PRESETS}
            value={preset}
            onChange={onPresetChange}
        />
        {preset === CUSTOM_PERIOD && (
            <>
                <DateLabel>
                    De
                    <FieldSlot>
                        <DateField
                            value={period.from}
                            max={period.to}
                            onChange={onFromChange}
                            disabled={isLoading}
                            aria-label="Data inicial"
                        />
                    </FieldSlot>
                </DateLabel>
                <DateLabel>
                    Até
                    <FieldSlot>
                        <DateField
                            value={period.to}
                            min={period.from}
                            onChange={onToChange}
                            disabled={isLoading}
                            aria-label="Data final"
                        />
                    </FieldSlot>
                </DateLabel>
            </>
        )}
        <IconButton icon={IconRefresh} label="Atualizar" onClick={onRefresh} disabled={isLoading} />
        {generatedAt && <Updated>Atualizado às {formatTime(generatedAt)}</Updated>}
    </StyledPeriodFilter>
)
