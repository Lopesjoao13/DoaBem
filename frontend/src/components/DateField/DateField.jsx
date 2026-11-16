import { IconCalendar, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar } from '@/components/Calendar/Calendar.jsx'
import { usePopover } from '@/hooks/usePopover.js'
import { maskFromValue, maskTypedDate, parseTypedDate } from '@/utils/dateMask.js'
import { DATE_MASK_LENGTH } from '@/constants/calendar.js'
import { ClearButton, IconSlot, Popover, StyledDateInput, Wrapper } from './DateField.styles.js'

export const DateField = ({
    value,
    name,
    min,
    max,
    error,
    disabled = false,
    onChange,
    ...props
}) => {
    const popover = usePopover({})
    const { triggerRef, popoverRef, style, isOpen } = popover
    const [draft, setDraft] = useState(null)

    const emit = (nextValue) => onChange({ target: { name, value: nextValue } })

    const handleType = (event) => {
        const masked = maskTypedDate(event.target.value)
        setDraft(masked)
        const parsed = parseTypedDate(masked, min, max)
        if (parsed) emit(parsed)
        else if (masked === '') emit('')
    }

    const handleSelect = (selected) => {
        emit(selected)
        setDraft(null)
        popover.close()
    }

    const handleClear = () => {
        emit('')
        setDraft(null)
        popover.close()
    }

    return (
        <Wrapper ref={triggerRef}>
            <StyledDateInput
                name={name}
                value={draft ?? maskFromValue(value)}
                placeholder="dd/mm/aaaa"
                inputMode="numeric"
                autoComplete="off"
                maxLength={DATE_MASK_LENGTH}
                disabled={disabled}
                aria-invalid={Boolean(error)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                $isFilled={Boolean(value)}
                $hasError={Boolean(error)}
                onChange={handleType}
                onBlur={() => setDraft(null)}
                onFocus={() => !disabled && popover.open()}
                onClick={() => !disabled && popover.open()}
                {...props}
            />
            {value && !disabled && (
                <ClearButton type="button" aria-label="Limpar data" onClick={handleClear}>
                    <IconX size={16} stroke={2} />
                </ClearButton>
            )}
            <IconSlot $isDisabled={disabled}>
                <IconCalendar size={18} stroke={2} />
            </IconSlot>
            {isOpen &&
                createPortal(
                    <Popover ref={popoverRef} style={style}>
                        <Calendar value={value} min={min} max={max} onSelect={handleSelect} />
                    </Popover>,
                    document.body,
                )}
        </Wrapper>
    )
}
