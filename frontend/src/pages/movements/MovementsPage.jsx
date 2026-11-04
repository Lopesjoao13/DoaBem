import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Pagination } from '@/components/Pagination/Pagination.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { useMovements } from '@/hooks/useMovements.js'
import { MovementDrawer } from './components/MovementDrawer/MovementDrawer.jsx'
import { MovementFilters } from './components/MovementFilters/MovementFilters.jsx'
import { MovementsTable } from './components/MovementsTable/MovementsTable.jsx'

const MovementsPage = () => {
    const movements = useMovements()
    const { page } = movements

    return (
        <>
            <PageHeader
                title="Movimentações"
                description="Histórico auditável de entradas, saídas por entrega, ajustes e estornos. Reservas aparecem no detalhe da solicitação."
            />
            <MovementFilters
                filters={movements.filters}
                itemOptions={movements.itemOptions}
                userOptions={movements.userOptions}
                onChange={movements.handleFilterChange}
                onClear={movements.clearFilters}
            />
            <Panel padded={false}>
                <MovementsTable
                    rows={page.content}
                    isLoading={movements.isLoading}
                    error={movements.error}
                    onRetry={movements.reload}
                    onOpen={movements.openMovement}
                />
                {page.totalElements > 0 && (
                    <Pagination
                        page={page.page}
                        totalPages={page.totalPages}
                        totalElements={page.totalElements}
                        onChange={movements.changePage}
                    />
                )}
            </Panel>
            {movements.selectedMovementId && (
                <MovementDrawer
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
