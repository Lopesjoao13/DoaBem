import { useRef } from 'react'
import { Group, Segment } from './SegmentedControl.styles.js'

export const SegmentedControl = ({ label, options, value, counts, onChange }) => {
    const groupRef = useRef(null)

    const handleKeyDown = (event, index) => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
        if (!step) return
        event.preventDefault()
        const next = (index + step + options.length) % options.length
        onChange(options[next].value)
        groupRef.current.querySelectorAll('[role="radio"]')[next].focus()
    }

    return (
        <Group ref={groupRef} role="radiogroup" aria-label={label}>
            {options.map((option, index) => {
                const isActive = option.value === value
                return (
                    <Segment
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        tabIndex={isActive ? 0 : -1}
                        $isActive={isActive}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                    >
                        {option.label}
                        {counts && <span>{counts[option.value] ?? 0}</span>}
                    </Segment>
                )
            })}
        </Group>
    )
}
