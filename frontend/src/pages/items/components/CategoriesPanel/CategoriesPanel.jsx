import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination.js'
import { Panel } from '@/components/Panel/Panel.jsx'
import { buildCategoriesColumns } from '@/pages/items/constants/categoriesColumns.jsx'

export const CategoriesPanel = ({ catalog, onEdit, onToggleStatus }) => (
    <Panel title="Categorias" padded={false}>
        <DataTable
            pageSize={DEFAULT_PAGE_SIZE}
            columns={buildCategoriesColumns(onEdit, onToggleStatus)}
            rows={catalog.categories}
            isLoading={catalog.isLoadingCategories}
            error={catalog.categoriesError}
            onRetry={catalog.reloadCategories}
            emptyTitle="Nenhuma categoria"
            emptyDescription="Cadastre categorias para organizar os itens."
        />
    </Panel>
)
