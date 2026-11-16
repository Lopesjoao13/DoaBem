import { IconMinus, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/Button/Button.jsx'
import { ExportButton } from '@/components/ExportButton/ExportButton.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { PERMISSIONS } from '@/constants/permissions.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { usePermission } from '@/hooks/usePermission.js'
import { useStock } from '@/pages/stock/hooks/useStock.js'
import { EntryDialog } from '@/components/EntryDialog/EntryDialog.jsx'
import { STOCK_EXPORT_COLUMNS } from '@/pages/stock/constants/stockExport.js'
import { AdjustmentDialog } from '@/components/AdjustmentDialog/AdjustmentDialog.jsx'
import { StockTable } from '@/pages/stock/components/StockTable/StockTable.jsx'
import { StockToolbar } from '@/pages/stock/components/StockToolbar/StockToolbar.jsx'

const StockPage = () => {
    const stock = useStock()
    const adjustment = useDisclosure()
    const entryDialog = useDisclosure()
    const canAdjust = usePermission(PERMISSIONS.ADJUST_STOCK)

    const handleAdjustmentSaved = () => {
        adjustment.close()
        stock.reload()
    }

    const handleEntrySaved = () => {
        entryDialog.close()
        stock.reload()
    }

    return (
        <>
            <PageHeader
                title="Estoque"
                description="Disponível = Físico − Reservado. Saldo somente leitura."
                actions={
                    <>
                        <ExportButton
                            filename="estoque"
                            columns={STOCK_EXPORT_COLUMNS}
                            getRows={() => stock.rows}
                        />
                        {canAdjust && (
                            <Button variant="outline" onClick={() => adjustment.open()}>
                                <IconMinus size={18} stroke={2} />
                                Saída por ajuste
                            </Button>
                        )}
                        <Button onClick={() => entryDialog.open()}>
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
                levels={stock.levels}
                levelCounts={stock.levelCounts}
                status={stock.status}
                isFiltered={stock.isFiltered}
                onSearchChange={stock.handleSearchChange}
                onCategoryChange={stock.handleCategoryChange}
                onLevelsChange={stock.changeLevels}
                onStatusChange={stock.changeStatus}
                onClear={stock.clearFilters}
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
            {entryDialog.isOpen && (
                <EntryDialog onClose={entryDialog.close} onSaved={handleEntrySaved} />
            )}
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
