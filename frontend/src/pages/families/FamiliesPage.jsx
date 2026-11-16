import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination.js'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FilterBar, FilterSlot } from '@/components/FilterBar/FilterBar.jsx'
import { SearchField } from '@/components/SearchField/SearchField.jsx'
import { StatusFilter } from '@/components/StatusFilter/StatusFilter.jsx'
import { FAMILY_PARAM } from '@/constants/families.js'
import { useDetailParam } from '@/hooks/useDetailParam.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useFamilies } from '@/pages/families/hooks/useFamilies.js'
import { FamilyDetailDialog } from '@/pages/families/components/FamilyDetailDialog/FamilyDetailDialog.jsx'
import { FamilyDialog } from '@/pages/families/components/FamilyDialog/FamilyDialog.jsx'
import { buildFamiliesColumns } from '@/pages/families/constants/familiesColumns.jsx'

const FamiliesPage = () => {
    const families = useFamilies()
    const dialog = useDisclosure()

    const detail = useDetailParam(FAMILY_PARAM)
    const { id: detailId, open: openDetail, close: closeDetail } = detail

    const handleSaved = (family) => {
        dialog.close()
        families.reload()
        openDetail(family.id)
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
            <FilterBar isFiltered={families.isFiltered} onClear={families.clearFilters}>
                <FilterSlot isGrowing>
                    <Field label="Buscar" htmlFor="families-search">
                        <SearchField
                            id="families-search"
                            value={families.search}
                            onChange={families.handleSearchChange}
                            placeholder="Nome do responsável"
                        />
                    </Field>
                </FilterSlot>
                <FilterSlot>
                    <Field label="Situação" htmlFor="families-status">
                        <StatusFilter
                            id="families-status"
                            value={families.status}
                            onChange={families.changeStatus}
                        />
                    </Field>
                </FilterSlot>
            </FilterBar>
            <Panel padded={false}>
                <DataTable
                    pageSize={DEFAULT_PAGE_SIZE}
                    columns={buildFamiliesColumns(openDetail)}
                    rows={families.families}
                    isLoading={families.isLoading}
                    error={families.error}
                    onRetry={families.reload}
                    emptyTitle="Nenhuma família encontrada"
                    emptyDescription="Ajuste a busca ou cadastre uma nova família."
                />
            </Panel>
            {detailId && (
                <FamilyDetailDialog
                    key={detailId}
                    familyId={detailId}
                    onClose={closeDetail}
                    onChanged={families.reload}
                />
            )}
            {dialog.isOpen && <FamilyDialog onClose={dialog.close} onSaved={handleSaved} />}
        </>
    )
}

export default FamiliesPage
