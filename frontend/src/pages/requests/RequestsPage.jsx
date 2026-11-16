import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination.js'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { REQUEST_PARAM } from '@/constants/requestActions.js'
import { useDetailParam } from '@/hooks/useDetailParam.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useRequests } from '@/pages/requests/hooks/useRequests.js'
import { RequestDetailDialog } from '@/pages/requests/components/RequestDetailDialog/RequestDetailDialog.jsx'
import { RequestDialog } from '@/components/RequestDialog/RequestDialog.jsx'
import { RequestsToolbar } from '@/pages/requests/components/RequestsToolbar/RequestsToolbar.jsx'
import { buildRequestsColumns } from '@/pages/requests/constants/requestsColumns.jsx'

const RequestsPage = () => {
    const requests = useRequests()
    const dialog = useDisclosure()
    const detail = useDetailParam(REQUEST_PARAM)
    const { id: detailId, open: openDetail, close: closeDetail } = detail

    const handleSaved = () => {
        dialog.close()
        requests.reload()
    }

    return (
        <>
            <PageHeader
                title="Solicitações"
                description="Pedidos das famílias: análise, separação com reserva e entrega."
                actions={
                    <Button onClick={() => dialog.open()}>
                        <IconPlus size={18} stroke={2} />
                        Nova solicitação
                    </Button>
                }
            />
            <RequestsToolbar
                tab={requests.tab}
                counts={requests.counts}
                filters={requests.filters}
                requestedByOptions={requests.requestedByOptions}
                isFiltered={requests.isFiltered}
                onTabChange={requests.changeTab}
                onChange={requests.handleFilterChange}
                onClear={requests.clearFilters}
            />
            <Panel padded={false}>
                <DataTable
                    pageSize={DEFAULT_PAGE_SIZE}
                    columns={buildRequestsColumns(openDetail)}
                    rows={requests.requests}
                    isLoading={requests.isLoading}
                    error={requests.error}
                    onRetry={requests.reload}
                    emptyTitle="Nenhuma solicitação encontrada"
                    emptyDescription="Ajuste os filtros ou crie uma nova solicitação."
                />
            </Panel>
            {detailId && (
                <RequestDetailDialog
                    key={detailId}
                    requestId={detailId}
                    onClose={closeDetail}
                    onChanged={requests.reload}
                />
            )}
            {dialog.isOpen && <RequestDialog onClose={dialog.close} onSaved={handleSaved} />}
        </>
    )
}

export default RequestsPage
