import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { ENTRY_ITEMS_COLUMNS } from '@/pages/entries/constants/entryItemsColumns.jsx'

export const EntryItemsTable = ({ items }) => (
    <DataTable columns={ENTRY_ITEMS_COLUMNS} rows={items} />
)
