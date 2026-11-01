import { IconCheck, IconChevronDown } from '@tabler/icons-react'
import { useCallback, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { SEARCHABLE_MIN_OPTIONS } from '@/constants/select.js'
import { usePopover } from '@/hooks/usePopover.js'
import { getSelectedLabel, matchesQuery, toggleValue } from '@/utils/select.js'
import {
    Check,
    Checkbox,
    Empty,
    List,
    Option,
    SearchInput,
    Trigger,
    Value,
    Wrapper,
} from './Select.styles.js'

export const Select = ({
    options,
    placeholder,
    allLabel = 'Todos',
    error,
    multiple = false,
    searchable = options.length >= SEARCHABLE_MIN_OPTIONS,
    id,
    name,
    value,
    disabled = false,
    onChange,
    ...props
}) => {
    const listId = useId()
    const [activeIndex, setActiveIndex] = useState(0)
    const [query, setQuery] = useState('')
    const clearQuery = useCallback(() => setQuery(''), [])
    const popover = usePopover({
        matchWidth: true,
        limitHeight: true,
        remeasureKey: query,
        onClose: clearQuery,
    })
    const { triggerRef, popoverRef, style, isOpen, close: closeList } = popover

    const allItems = multiple || !placeholder ? options : [placeholder, ...options]
    const items = query ? allItems.filter((item) => matchesQuery(item.label, query)) : allItems
    const selectedValues = multiple ? value : [value]

    const open = () => {
        const selectedIndex = allItems.findIndex((item) => selectedValues.includes(item.value))
        setActiveIndex(Math.max(selectedIndex, 0))
        popover.open()
    }

    const choose = (item) => {
        const next = multiple ? toggleValue(value, item.value) : item.value
        onChange({ target: { name, value: next } })
        if (!multiple) closeList()
    }

    const handleQueryChange = (event) => {
        setQuery(event.target.value)
        setActiveIndex(0)
    }

    const handleKeyDown = (event) => {
        if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault()
            if (!isOpen) return open()
            if (items.length === 0) return undefined
            const step = event.key === 'ArrowDown' ? 1 : -1
            setActiveIndex((current) => (current + step + items.length) % items.length)
            return undefined
        }
        const isSelectKey = event.key === 'Enter' || (event.key === ' ' && !searchable)
        if (isSelectKey && isOpen && items[activeIndex]) {
            event.preventDefault()
            choose(items[activeIndex])
        }
        return undefined
    }

    return (
        <Wrapper ref={triggerRef}>
            <Trigger
                id={id}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-invalid={Boolean(error)}
                aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
                $hasError={Boolean(error)}
                $isOpen={isOpen}
                disabled={disabled}
                onClick={() => (isOpen ? closeList() : open())}
                onKeyDown={handleKeyDown}
                {...props}
            >
                <Value>
                    {getSelectedLabel({ options, value, multiple, placeholder, allLabel })}
                </Value>
                <IconChevronDown size={16} stroke={2} aria-hidden="true" />
            </Trigger>
            {isOpen &&
                createPortal(
                    <List
                        ref={popoverRef}
                        id={listId}
                        role="listbox"
                        aria-multiselectable={multiple}
                        style={style}
                    >
                        {searchable && (
                            <SearchInput
                                type="search"
                                value={query}
                                placeholder="Buscar..."
                                aria-label="Buscar opção"
                                autoFocus
                                onChange={handleQueryChange}
                                onKeyDown={handleKeyDown}
                            />
                        )}
                        {items.length === 0 && <Empty>Nenhum resultado</Empty>}
                        {items.map((item, index) => {
                            const isSelected = selectedValues.includes(item.value)
                            return (
                                <Option
                                    key={item.value}
                                    id={`${listId}-${index}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    $isActive={index === activeIndex}
                                    $isSelected={isSelected}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => choose(item)}
                                >
                                    {multiple && (
                                        <Checkbox $isChecked={isSelected}>
                                            {isSelected && <IconCheck size={12} stroke={3} />}
                                        </Checkbox>
                                    )}
                                    {item.label}
                                    {!multiple && isSelected && (
                                        <Check>
                                            <IconCheck size={16} stroke={2} />
                                        </Check>
                                    )}
                                </Option>
                            )
                        })}
                    </List>,
                    document.body,
                )}
        </Wrapper>
    )
}
