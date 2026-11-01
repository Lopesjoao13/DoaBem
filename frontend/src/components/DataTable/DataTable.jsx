import { IconArrowsSort, IconLoader2 } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Pagination } from '@/components/Pagination/Pagination.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { ARIA_SORT, SORT_DIRECTIONS, SORT_ICONS } from '@/constants/sort.js'
import { STATE_VARIANTS } from '@/constants/stateMessages.js'
import {
    Cell,
    HeaderCell,
    Overlay,
    Row,
    Scroll,
    SortButton,
    Table,
    Wrapper,
} from './DataTable.styles.js'

const defaultRowKey = (row) => row.id

const compareValues = (first, second) => {
    if (typeof first === 'string' && typeof second === 'string') {
        return first.localeCompare(second, 'pt-BR')
    }
    return first - second
}

const sortRows = (rows, column, direction) => {
    if (!column) return rows
    const factor = direction === SORT_DIRECTIONS.ASC ? 1 : -1
    return [...rows].sort(
        (first, second) =>
            factor * compareValues(column.sortValue(first), column.sortValue(second)),
    )
}

const nextSort = (current, key) => {
    if (current.key !== key) return { key, direction: SORT_DIRECTIONS.ASC }
    if (current.direction === SORT_DIRECTIONS.ASC) return { key, direction: SORT_DIRECTIONS.DESC }
    return { key: null, direction: SORT_DIRECTIONS.ASC }
}

const HeaderContent = ({ column, direction, onSort }) => {
    if (!column.sortValue) return column.header
    const Icon = SORT_ICONS[direction] ?? IconArrowsSort
    return (
        <SortButton type="button" $isActive={Boolean(direction)} onClick={() => onSort(column.key)}>
            {column.header}
            <Icon size={14} stroke={2} aria-hidden="true" />
        </SortButton>
    )
}

const TableBody = ({ columns, rows, getRowKey, getRowTone }) => (
    <tbody>
        {rows.map((row) => (
            <Row key={getRowKey(row)} $tone={getRowTone?.(row)}>
                {columns.map(({ key, noWrap, render }) => (
                    <Cell key={key} $noWrap={noWrap}>
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
    isRefreshing = false,
    error = '',
    onRetry,
    emptyTitle,
    emptyDescription,
    pageSize,
}) => {
    const [sort, setSort] = useState({ key: null, direction: SORT_DIRECTIONS.ASC })
    const [requestedPage, setRequestedPage] = useState(0)

    const sortedRows = useMemo(
        () =>
            sortRows(
                rows,
                columns.find((column) => column.key === sort.key),
                sort.direction,
            ),
        [rows, columns, sort],
    )

    const totalPages = pageSize ? Math.ceil(sortedRows.length / pageSize) : 1
    const page = Math.min(requestedPage, Math.max(totalPages - 1, 0))
    const visibleRows = pageSize
        ? sortedRows.slice(page * pageSize, (page + 1) * pageSize)
        : sortedRows

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
        <Wrapper>
            <Scroll $isRefreshing={isRefreshing} aria-busy={isRefreshing}>
                <Table>
                    <thead>
                        <tr>
                            {columns.map((column) => {
                                const direction =
                                    sort.key === column.key ? sort.direction : undefined
                                return (
                                    <HeaderCell
                                        key={column.key}
                                        scope="col"
                                        aria-sort={direction ? ARIA_SORT[direction] : undefined}
                                    >
                                        <HeaderContent
                                            column={column}
                                            direction={direction}
                                            onSort={(key) => {
                                                setSort((current) => nextSort(current, key))
                                                setRequestedPage(0)
                                            }}
                                        />
                                    </HeaderCell>
                                )
                            })}
                        </tr>
                    </thead>
                    <TableBody
                        columns={columns}
                        rows={visibleRows}
                        getRowKey={getRowKey}
                        getRowTone={getRowTone}
                    />
                </Table>
            </Scroll>
            {isRefreshing && (
                <Overlay role="status" aria-label="Carregando">
                    <IconLoader2 size={28} stroke={2} />
                </Overlay>
            )}
            {pageSize && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalElements={sortedRows.length}
                    onChange={setRequestedPage}
                />
            )}
        </Wrapper>
    )
}
