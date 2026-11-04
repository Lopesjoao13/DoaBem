import { IconPlus } from '@tabler/icons-react'
import { generatePath, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { FilterChips } from '@/components/FilterChips/FilterChips.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { SearchField } from '@/components/SearchField/SearchField.jsx'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import { Toolbar } from '@/components/Toolbar/Toolbar.jsx'
import { RECORD_STATUS_LABELS, RECORD_STATUS_TONES } from '@/constants/recordStatus.js'
import { ROUTES } from '@/constants/routes.js'
import { STATUS_FILTER_OPTIONS } from '@/constants/stockFilters.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useFamilies } from '@/hooks/useFamilies.js'
import { FamilyDialog } from './components/FamilyDialog/FamilyDialog.jsx'

const COLUMNS = [
    { key: 'id', header: 'Nº', render: (row) => `#${row.id}` },
    { key: 'responsibleName', header: 'Responsável' },
    { key: 'householdSize', header: 'Integrantes', align: 'right' },
    { key: 'neighborhood', header: 'Bairro', render: (row) => row.neighborhood || '—' },
    { key: 'phone', header: 'Telefone', noWrap: true, render: (row) => row.phone || '—' },
    {
        key: 'status',
        header: 'Situação',
        render: (row) => (
            <Badge tone={RECORD_STATUS_TONES[row.status]}>{RECORD_STATUS_LABELS[row.status]}</Badge>
        ),
    },
    {
        key: 'actions',
        header: 'Ações',
        align: 'right',
        render: (row) => (
            <TextLink to={generatePath(ROUTES.FAMILY_DETAIL, { id: row.id })}>
                Ver detalhes
            </TextLink>
        ),
    },
]

const FamiliesPage = () => {
    const navigate = useNavigate()
    const families = useFamilies()
    const dialog = useDisclosure()

    const handleSaved = (family) => {
        dialog.close()
        navigate(generatePath(ROUTES.FAMILY_DETAIL, { id: family.id }))
    }

    return (
        <>
            <PageHeader
                title="Famílias / beneficiários"
                description="Núcleos familiares identificados pelo responsável. Somente famílias ativas recebem novas solicitações."
                actions={
                    <Button onClick={() => dialog.open()}>
                        <IconPlus size={18} stroke={2} />
                        Nova família
                    </Button>
                }
            />
            <Toolbar>
                <SearchField
                    value={families.search}
                    onChange={families.handleSearchChange}
                    placeholder="Buscar pelo nome do responsável"
                    aria-label="Buscar famílias"
                />
                <FilterChips
                    label="Filtrar por situação"
                    options={STATUS_FILTER_OPTIONS}
                    value={families.status}
                    onChange={families.changeStatus}
                />
            </Toolbar>
            <Panel padded={false}>
                <DataTable
                    columns={COLUMNS}
                    rows={families.families}
                    isLoading={families.isLoading}
                    error={families.error}
                    onRetry={families.reload}
                    emptyTitle="Nenhuma família encontrada"
                    emptyDescription="Ajuste a busca ou cadastre uma nova família."
                />
            </Panel>
            {dialog.isOpen && <FamilyDialog onClose={dialog.close} onSaved={handleSaved} />}
        </>
    )
}

export default FamiliesPage
