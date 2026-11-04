import { Button } from '@/components/Button/Button.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { STATE_VARIANTS } from '@/constants/stateMessages.js'
import { Cell, HeaderCell, Row, Scroll, Table } from './DataTable.styles.js'

const defaultRowKey = (row) => row.id

const TableBody = ({ columns, rows, getRowKey, getRowTone }) => (
    <tbody>
        {rows.map((row) => (
            <Row key={getRowKey(row)} $tone={getRowTone?.(row)}>
                {columns.map(({ key, align, noWrap, render }) => (
                    <Cell key={key} $align={align} $noWrap={noWrap}>
                        {render ? render(row) : row[key]}
                    </Cell>
                ))}
            </Row>
        ))}
    </tbody>
)

export const DataTable = ({
    columns,
    rows,
    getRowKey = defaultRowKey,
    getRowTone,
    isLoading = false,
    error = '',
    onRetry,
    emptyTitle,
    emptyDescription,
}) => {
    if (isLoading) return <StateMessage variant={STATE_VARIANTS.LOADING} />

    if (error) {
        return (
            <StateMessage
                variant={STATE_VARIANTS.ERROR}
                description={error}
                action={
                    onRetry && (
                        <Button variant="outline" onClick={onRetry}>
                            Tentar novamente
                        </Button>
                    )
                }
            />
        )
    }

    if (rows.length === 0) {
        return <StateMessage title={emptyTitle} description={emptyDescription} />
    }

    return (
        <Scroll>
            <Table>
                <thead>
                    <tr>
                        {columns.map(({ key, header, align }) => (
                            <HeaderCell key={key} scope="col" $align={align}>
                                {header}
                            </HeaderCell>
                        ))}
                    </tr>
                </thead>
                <TableBody
                    columns={columns}
                    rows={rows}
                    getRowKey={getRowKey}
                    getRowTone={getRowTone}
                />
            </Table>
        </Scroll>
    )
}
