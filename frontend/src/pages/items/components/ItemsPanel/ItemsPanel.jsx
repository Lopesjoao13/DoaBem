import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination.js'
import { Field } from '@/components/Field/Field.jsx'
import { FilterBar, FilterSlot } from '@/components/FilterBar/FilterBar.jsx'
import { SearchField } from '@/components/SearchField/SearchField.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { StatusFilter } from '@/components/StatusFilter/StatusFilter.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { ALL_CATEGORIES } from '@/constants/filterOptions.js'
import { buildItemsColumns } from '@/pages/items/constants/itemsColumns.jsx'

export const ItemsPanel = ({ catalog, onEdit, onToggleStatus }) => (
    <>
        <FilterBar isFiltered={catalog.isItemsFiltered} onClear={catalog.clearItemFilters}>
            <FilterSlot isGrowing>
                <Field label="Buscar" htmlFor="items-search">
                    <SearchField
                        id="items-search"
                        name="itemSearch"
                        value={catalog.itemFilters.itemSearch}
                        onChange={catalog.handleItemFilterChange}
                        placeholder="Nome do item ou categoria"
                    />
                </Field>
            </FilterSlot>
            <FilterSlot>
                <Field label="Categoria" htmlFor="items-category">
                    <Select
                        id="items-category"
                        name="itemCategoryId"
                        value={catalog.itemFilters.itemCategoryId}
                        onChange={catalog.handleItemFilterChange}
                        options={catalog.categoryOptions}
                        placeholder={ALL_CATEGORIES}
                    />
                </Field>
            </FilterSlot>
            <FilterSlot>
                <Field label="Situação" htmlFor="items-status">
                    <StatusFilter
                        id="items-status"
                        value={catalog.itemFilters.itemStatus}
                        onChange={catalog.changeItemStatus}
                    />
                </Field>
            </FilterSlot>
        </FilterBar>
        <Panel title="Itens" padded={false}>
            <DataTable
                pageSize={DEFAULT_PAGE_SIZE}
                columns={buildItemsColumns(onEdit, onToggleStatus)}
                rows={catalog.items}
                isLoading={catalog.isLoadingItems}
                error={catalog.itemsError}
                onRetry={catalog.reloadItems}
                emptyTitle="Nenhum item encontrado"
                emptyDescription="Ajuste os filtros ou cadastre itens para controlar o estoque."
            />
        </Panel>
    </>
)
