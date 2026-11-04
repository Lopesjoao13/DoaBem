import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { CATALOG_MESSAGES, CATALOG_TARGETS } from '@/constants/catalogMessages.js'
import { PERMISSIONS } from '@/constants/permissions.js'
import { TONES } from '@/constants/tones.js'
import { useCatalog } from '@/hooks/useCatalog.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { usePermission } from '@/hooks/usePermission.js'
import { CategoriesPanel } from './components/CategoriesPanel/CategoriesPanel.jsx'
import { CategoryDialog } from './components/CategoryDialog/CategoryDialog.jsx'
import { ItemDialog } from './components/ItemDialog/ItemDialog.jsx'
import { ItemsPanel } from './components/ItemsPanel/ItemsPanel.jsx'
import { StatusConfirm } from './components/StatusConfirm/StatusConfirm.jsx'

const ItemsPage = () => {
    const catalog = useCatalog()
    const canManage = usePermission(PERMISSIONS.MANAGE_CATALOG)
    const itemDialog = useDisclosure()
    const categoryDialog = useDisclosure()
    const statusConfirm = useDisclosure()

    const handleItemSaved = () => {
        itemDialog.close()
        catalog.reloadAll()
    }

    const handleCategorySaved = () => {
        categoryDialog.close()
        catalog.reloadAll()
    }

    const handleStatusChanged = () => {
        statusConfirm.close()
        catalog.reloadAll()
    }

    return (
        <>
            <PageHeader
                title="Itens e categorias"
                description="Cada item tem uma unidade base (un, kg ou L) e um estoque mínimo. Itens inativos continuam nos históricos."
                actions={
                    canManage && (
                        <>
                            <Button variant="outline" onClick={() => categoryDialog.open()}>
                                <IconPlus size={18} stroke={2} />
                                Nova categoria
                            </Button>
                            <Button onClick={() => itemDialog.open()}>
                                <IconPlus size={18} stroke={2} />
                                Novo item
                            </Button>
                        </>
                    )
                }
            />
            {!canManage && <Callout tone={TONES.INFO}>{CATALOG_MESSAGES.readOnly}</Callout>}
            <ItemsPanel
                catalog={catalog}
                onEdit={canManage ? itemDialog.open : undefined}
                onToggleStatus={
                    canManage
                        ? (item) => statusConfirm.open({ kind: CATALOG_TARGETS.ITEM, record: item })
                        : undefined
                }
            />
            <CategoriesPanel
                catalog={catalog}
                onEdit={canManage ? categoryDialog.open : undefined}
                onToggleStatus={
                    canManage
                        ? (category) =>
                              statusConfirm.open({
                                  kind: CATALOG_TARGETS.CATEGORY,
                                  record: category,
                              })
                        : undefined
                }
            />
            {itemDialog.isOpen && (
                <ItemDialog
                    item={itemDialog.payload}
                    categories={catalog.categories}
                    onClose={itemDialog.close}
                    onSaved={handleItemSaved}
                />
            )}
            {categoryDialog.isOpen && (
                <CategoryDialog
                    category={categoryDialog.payload}
                    onClose={categoryDialog.close}
                    onSaved={handleCategorySaved}
                />
            )}
            {statusConfirm.isOpen && (
                <StatusConfirm
                    target={statusConfirm.payload}
                    onClose={statusConfirm.close}
                    onChanged={handleStatusChanged}
                />
            )}
        </>
    )
}

export default ItemsPage
