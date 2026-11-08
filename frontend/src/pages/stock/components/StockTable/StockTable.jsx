import { useMemo } from 'react'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination.js'
import {
    STOCK_COLUMNS,
    buildStockActionsColumn,
    getStockRowKey,
} from '@/pages/stock/constants/stockColumns.jsx'

export const StockTable = ({ rows, isLoading, error, onRetry, onAdjust }) => {
    const columns = useMemo(() => [...STOCK_COLUMNS, buildStockActionsColumn(onAdjust)], [onAdjust])

    return (
        <DataTable
            pageSize={DEFAULT_PAGE_SIZE}
            columns={columns}
            rows={rows}
            getRowKey={getStockRowKey}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            emptyTitle="Nenhum item encontrado"
            emptyDescription="Ajuste a busca ou os filtros para ver outros itens."
        />
    )
}
