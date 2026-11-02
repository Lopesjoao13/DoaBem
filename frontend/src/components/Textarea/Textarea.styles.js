import styled from 'styled-components'
import { fieldControlStyles, readOnlyStyles } from '@/components/Input/Input.styles.js'

export const StyledTextarea = styled.textarea`
    ${fieldControlStyles}
    ${readOnlyStyles}
    height: auto;
    min-height: 96px;
    padding: 12px 16px;
    resize: vertical;
`
