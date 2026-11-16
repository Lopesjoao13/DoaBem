import styled from 'styled-components'

export const Wrapper = styled.div`
    position: relative;
    min-width: 0;
`

export const Trigger = styled.button`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    height: var(--input-height);
    padding: 0 16px;
    border: 1px solid
        ${({ $hasError, $isOpen }) => {
            if ($hasError) return 'var(--red-500)'
            return $isOpen ? 'var(--color-fg)' : 'var(--color-border-strong)'
        }};
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-fg);
    font: inherit;
    font-size: 14px;
    letter-spacing: var(--tracking-base);
    text-align: left;
    cursor: pointer;
    transition: border-color var(--duration-fast) var(--ease-out);

    &:hover:not(:disabled) {
        border-color: ${({ $hasError }) => ($hasError ? 'var(--red-500)' : 'var(--gray-600)')};
    }

    &:focus-visible {
        outline: none;
        border-color: var(--color-fg);
    }

    &:disabled {
        border-color: var(--gray-200);
        background: var(--gray-100);
        color: var(--gray-600);
        cursor: not-allowed;
    }

    > svg {
        flex: none;
        color: var(--color-fg-muted);
        transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'none')};
        transition: transform var(--duration-fast) var(--ease-out);
    }
`

export const Value = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

export const List = styled.ul`
    position: fixed;
    z-index: 70;
    margin: 0;
    padding: 4px;
    overflow-y: auto;
    list-style: none;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius);
    background: var(--color-surface);
    box-shadow: var(--shadow-modal);
`

export const Option = styled.li`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: var(--radius-xs);
    background: ${({ $isActive }) => ($isActive ? 'var(--blue-50)' : 'transparent')};
    font-size: 14px;
    font-weight: ${({ $isSelected }) => ($isSelected ? 600 : 400)};
    white-space: nowrap;
    cursor: pointer;
`

export const Checkbox = styled.span`
    display: grid;
    place-items: center;
    flex: none;
    width: 16px;
    height: 16px;
    border: 1px solid ${({ $isChecked }) => ($isChecked ? 'var(--teal-500)' : 'var(--gray-600)')};
    border-radius: 3px;
    background: ${({ $isChecked }) => ($isChecked ? 'var(--teal-500)' : 'var(--color-surface)')};
    color: var(--white);
`

export const Check = styled.span`
    display: grid;
    margin-left: auto;
    color: var(--teal-500);
`

export const SearchInput = styled.input`
    position: sticky;
    top: 0;
    z-index: 1;
    width: 100%;
    height: 36px;
    margin-bottom: 4px;
    padding: 0 12px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-xs);
    background: var(--color-surface);
    color: var(--color-fg);
    font: inherit;
    font-size: 14px;

    &::-webkit-search-cancel-button {
        display: none;
    }

    &::placeholder {
        color: var(--gray-400);
    }

    &:focus {
        outline: none;
        border-color: var(--color-fg);
    }
`

export const Empty = styled.li`
    padding: 8px 12px;
    font-size: 14px;
    color: var(--color-fg-muted);
`
