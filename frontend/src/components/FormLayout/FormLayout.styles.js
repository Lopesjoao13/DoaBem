import styled from 'styled-components'

export const StyledFormStack = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`

export const StyledFormRow = styled.div`
    display: grid;
    grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
    gap: 16px;
`
