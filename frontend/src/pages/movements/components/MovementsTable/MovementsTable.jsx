import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { buildMovementsColumns } from '@/pages/movements/constants/movementsColumns.jsx'

export const MovementsTable = ({ rows, isLoading, isRefreshing, error, onRetry, onOpen }) => (
    <DataTable
        columns={buildMovementsColumns(onOpen)}
        rows={rows}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        onRetry={onRetry}
        emptyTitle="Nenhuma movimentação encontrada"
        emptyDescription="Ajuste o período ou os filtros."
    />
)
