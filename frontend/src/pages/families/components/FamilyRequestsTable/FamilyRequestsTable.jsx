import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { FAMILY_REQUESTS_COLUMNS } from '@/pages/families/constants/familyRequestsColumns.jsx'

export const FamilyRequestsTable = ({ requests }) => (
    <DataTable
        columns={FAMILY_REQUESTS_COLUMNS}
        rows={requests}
        emptyTitle="Nenhuma solicitação"
        emptyDescription="As solicitações desta família aparecem aqui."
    />
)
