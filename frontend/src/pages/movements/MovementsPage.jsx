import { ExportButton } from '@/components/ExportButton/ExportButton.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Pagination } from '@/components/Pagination/Pagination.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { useMovements } from '@/pages/movements/hooks/useMovements.js'
import { MOVEMENTS_EXPORT_COLUMNS } from '@/pages/movements/constants/movementsExport.js'
import { MovementDetailDialog } from '@/pages/movements/components/MovementDetailDialog/MovementDetailDialog.jsx'
import { MovementFilters } from '@/pages/movements/components/MovementFilters/MovementFilters.jsx'
import { MovementsTable } from '@/pages/movements/components/MovementsTable/MovementsTable.jsx'

const MovementsPage = () => {
    const movements = useMovements()
    const { page } = movements

    return (
        <>
            <PageHeader
                title="Movimentações"
                actions={
                    <ExportButton
                        filename="movimentacoes"
                        columns={MOVEMENTS_EXPORT_COLUMNS}
                        getRows={movements.fetchAll}
                    />
                }
                description="Histórico auditável de entradas, saídas por entrega, ajustes e estornos. Reservas aparecem no detalhe da solicitação."
            />
            <MovementFilters
                filters={movements.filters}
                itemOptions={movements.itemOptions}
                userOptions={movements.userOptions}
                isFiltered={movements.isFiltered}
                onChange={movements.handleFilterChange}
                onClear={movements.clearFilters}
            />
            <Panel padded={false}>
                <MovementsTable
                    rows={page.content}
                    isLoading={movements.isLoading}
                    isRefreshing={movements.isRefreshing}
                    error={movements.error}
                    onRetry={movements.reload}
                    onOpen={movements.openMovement}
                />
                {page.totalElements > 0 && (
                    <Pagination
                        page={page.page}
                        totalPages={page.totalPages}
                        totalElements={page.totalElements}
                        isDisabled={movements.isRefreshing}
                        onChange={movements.changePage}
                    />
                )}
            </Panel>
            {movements.selectedMovementId && (
                <MovementDetailDialog
                    key={movements.selectedMovementId}
                    movementId={movements.selectedMovementId}
                    onClose={movements.closeMovement}
                    onOpen={movements.openMovement}
                    onChanged={movements.reload}
                />
            )}
        </>
    )
}

export default MovementsPage
