import styled from 'styled-components'
import { fieldControlStyles, readOnlyStyles } from '@/components/Input/Input.styles.js'

export const StyledTextarea = styled.textarea`
    ${fieldControlStyles}
    ${readOnlyStyles}
  resize: vertical;
`
