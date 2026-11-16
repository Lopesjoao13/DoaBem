import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination.js'
import { ExportButton } from '@/components/ExportButton/ExportButton.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { ENTRY_PARAM } from '@/constants/entries.js'
import { useDetailParam } from '@/hooks/useDetailParam.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useEntries } from '@/pages/entries/hooks/useEntries.js'
import { ENTRIES_EXPORT_COLUMNS } from '@/pages/entries/constants/entriesExport.js'
import { EntriesToolbar } from '@/pages/entries/components/EntriesToolbar/EntriesToolbar.jsx'
import { EntryDetailDialog } from '@/pages/entries/components/EntryDetailDialog/EntryDetailDialog.jsx'
import { EntryDialog } from '@/components/EntryDialog/EntryDialog.jsx'
import { buildEntriesColumns } from '@/pages/entries/constants/entriesColumns.jsx'

const EntriesPage = () => {
    const entriesState = useEntries()
    const { entries, error, isLoading, reload } = entriesState
    const dialog = useDisclosure()
    const detail = useDetailParam(ENTRY_PARAM)
    const { id: detailId, open: openDetail, close: closeDetail } = detail

    const handleSaved = () => {
        dialog.close()
        reload()
    }

    return (
        <>
            <PageHeader
                title="Entradas de doação"
                description="Doações recebidas. Cada linha da entrada gera uma movimentação no histórico do item."
                actions={
                    <>
                        <ExportButton
                            filename="entradas"
                            columns={ENTRIES_EXPORT_COLUMNS}
                            getRows={() => entries}
                        />
                        <Button onClick={() => dialog.open()}>
                            <IconPlus size={18} stroke={2} />
                            Nova entrada
                        </Button>
                    </>
                }
            />
            <EntriesToolbar
                filters={entriesState.filters}
                registeredByOptions={entriesState.registeredByOptions}
                itemOptions={entriesState.itemOptions}
                isFiltered={entriesState.isFiltered}
                onChange={entriesState.handleFilterChange}
                onClear={entriesState.clearFilters}
            />
            <Panel padded={false}>
                <DataTable
                    pageSize={DEFAULT_PAGE_SIZE}
                    columns={buildEntriesColumns(openDetail)}
                    rows={entries}
                    isLoading={isLoading && entries.length === 0}
                    error={error}
                    onRetry={reload}
                    emptyTitle="Nenhuma entrada registrada"
                    emptyDescription={
                        entriesState.isFiltered
                            ? 'Ajuste os filtros para ver outras entradas.'
                            : 'Registre a primeira doação recebida.'
                    }
                />
            </Panel>
            {detailId && (
                <EntryDetailDialog key={detailId} entryId={detailId} onClose={closeDetail} />
            )}
            {dialog.isOpen && <EntryDialog onClose={dialog.close} onSaved={handleSaved} />}
        </>
    )
}

export default EntriesPage
