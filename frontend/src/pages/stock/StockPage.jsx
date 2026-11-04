import { IconMinus, IconPlus } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button/Button.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { PERMISSIONS } from '@/constants/permissions.js'
import { ROUTES } from '@/constants/routes.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { usePermission } from '@/hooks/usePermission.js'
import { useStock } from '@/hooks/useStock.js'
import { AdjustmentDialog } from './components/AdjustmentDialog/AdjustmentDialog.jsx'
import { StockTable } from './components/StockTable/StockTable.jsx'
import { StockToolbar } from './components/StockToolbar/StockToolbar.jsx'

const StockPage = () => {
    const navigate = useNavigate()
    const stock = useStock()
    const adjustment = useDisclosure()
    const canAdjust = usePermission(PERMISSIONS.ADJUST_STOCK)

    const handleAdjustmentSaved = () => {
        adjustment.close()
        stock.reload()
    }

    return (
        <>
            <PageHeader
                title="Estoque"
                description="Disponível = Físico − Reservado. O saldo é somente leitura: altere-o por entradas, entregas e ajustes."
                actions={
                    <>
                        {canAdjust && (
                            <Button
                                variant="outline"
                                family="deny"
                                onClick={() => adjustment.open()}
                            >
                                <IconMinus size={18} stroke={2} />
                                Registrar saída por ajuste
                            </Button>
                        )}
                        <Button onClick={() => navigate(ROUTES.ENTRY_NEW)}>
                            <IconPlus size={18} stroke={2} />
                            Nova entrada
                        </Button>
                    </>
                }
            />
            <StockToolbar
                search={stock.search}
                categoryId={stock.categoryId}
                categories={stock.categories}
                level={stock.level}
                levelCounts={stock.levelCounts}
                status={stock.status}
                onSearchChange={stock.handleSearchChange}
                onCategoryChange={stock.handleCategoryChange}
                onLevelChange={stock.changeLevel}
                onStatusChange={stock.changeStatus}
            />
            <Panel padded={false}>
                <StockTable
                    rows={stock.rows}
                    isLoading={stock.isLoading}
                    error={stock.error}
                    onRetry={stock.reload}
                    onAdjust={canAdjust ? adjustment.open : undefined}
                />
            </Panel>
            {adjustment.isOpen && (
                <AdjustmentDialog
                    initialItemId={adjustment.payload}
                    onClose={adjustment.close}
                    onSaved={handleAdjustmentSaved}
                />
            )}
        </>
    )
}

export default StockPage
