import { IconPlus } from '@tabler/icons-react'
import { generatePath, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import { ROUTES } from '@/constants/routes.js'
import { useEntries } from '@/hooks/useEntries.js'
import { describeEntrySource } from '@/utils/entries.js'
import { formatDate } from '@/utils/formatters.js'

const COLUMNS = [
    { key: 'entryDate', header: 'Data', noWrap: true, render: (row) => formatDate(row.entryDate) },
    {
        key: 'source',
        header: 'Entrada / origem',
        render: (row) => `Entrada #${row.id} — ${describeEntrySource(row)}`,
    },
    { key: 'registeredBy', header: 'Registrado por' },
    {
        key: 'actions',
        header: 'Ações',
        align: 'right',
        render: (row) => (
            <TextLink to={generatePath(ROUTES.ENTRY_DETAIL, { id: row.id })}>Ver detalhe</TextLink>
        ),
    },
]

const EntriesPage = () => {
    const navigate = useNavigate()
    const { entries, error, isLoading, reload } = useEntries()

    return (
        <>
            <PageHeader
                title="Entradas de doação"
                description="Doações recebidas. Cada linha da entrada gera uma movimentação no histórico do item."
                actions={
                    <Button onClick={() => navigate(ROUTES.ENTRY_NEW)}>
                        <IconPlus size={18} stroke={2} />
                        Nova entrada
                    </Button>
                }
            />
            <Panel padded={false}>
                <DataTable
                    columns={COLUMNS}
                    rows={entries}
                    isLoading={isLoading && entries.length === 0}
                    error={error}
                    onRetry={reload}
                    emptyTitle="Nenhuma entrada registrada"
                    emptyDescription="Registre a primeira doação recebida."
                />
            </Panel>
        </>
    )
}

export default EntriesPage
