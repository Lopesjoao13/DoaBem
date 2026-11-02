import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { buildRequestItemsColumns } from '@/pages/requests/constants/requestItemsColumns.jsx'

export const RequestItemsTable = ({ request }) => (
    <DataTable columns={buildRequestItemsColumns(request.status)} rows={request.items} />
)
