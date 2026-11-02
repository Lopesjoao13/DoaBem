import { useCallback, useMemo } from 'react'
import { ALL_FILTER } from '@/constants/stockFilters.js'
import { useFetch } from '@/hooks/useFetch.js'
import { useFilterParams } from '@/hooks/useFilterParams.js'
import { listCategories, listItems } from '@/services/catalogService.js'
import { matchesText } from '@/utils/search.js'
import { EMPTY_ROWS } from '@/constants/emptyValues.js'
import {
    CATALOG_DEFAULT_FILTERS,
    CATALOG_FILTER_VALIDATORS,
    CATALOG_ITEM_FILTER_KEYS,
} from '@/pages/items/constants/filterDefaults.js'

export const useCatalog = () => {
    const { filters, setFilters, clearFilters } = useFilterParams(
        CATALOG_DEFAULT_FILTERS,
        CATALOG_FILTER_VALIDATORS,
    )
    const { tab, itemStatus, itemSearch, itemCategoryId } = filters

    const loadItems = useCallback(() => listItems({ status: itemStatus }), [itemStatus])
    const items = useFetch(loadItems)
    const categories = useFetch(listCategories)
    const itemRows = items.data?.content ?? EMPTY_ROWS

    const visibleItems = useMemo(
        () =>
            itemRows.filter(
                (item) =>
                    (!itemSearch.trim() ||
                        matchesText([item.name, item.categoryName], itemSearch)) &&
                    (itemCategoryId === ALL_FILTER || String(item.categoryId) === itemCategoryId),
            ),
        [itemRows, itemSearch, itemCategoryId],
    )
    const categoryRows = categories.data?.content ?? EMPTY_ROWS
    const categoryOptions = useMemo(
        () =>
            categoryRows.map((category) => ({ value: String(category.id), label: category.name })),
        [categoryRows],
    )

    const changeTab = (value) => setFilters({ tab: value })

    const changeItemStatus = (value) => setFilters({ itemStatus: value })

    const handleItemFilterChange = (event) => {
        const { name, value } = event.target
        setFilters({ [name]: value })
    }

    const clearItemFilters = () =>
        setFilters(
            Object.fromEntries(
                CATALOG_ITEM_FILTER_KEYS.map((key) => [key, CATALOG_DEFAULT_FILTERS[key]]),
            ),
        )

    const reloadAll = useCallback(() => {
        items.reload()
        categories.reload()
    }, [items, categories])

    return {
        tab,
        items: visibleItems,
        itemsError: items.error,
        isLoadingItems: items.isLoading && !items.data,
        categories: categoryRows,
        categoryOptions,
        categoriesError: categories.error,
        isLoadingCategories: categories.isLoading && !categories.data,
        itemFilters: { itemStatus, itemSearch, itemCategoryId },
        isItemsFiltered: CATALOG_ITEM_FILTER_KEYS.some(
            (key) => filters[key] !== CATALOG_DEFAULT_FILTERS[key],
        ),
        changeTab,
        changeItemStatus,
        handleItemFilterChange,
        clearItemFilters,
        clearFilters,
        reloadItems: items.reload,
        reloadCategories: categories.reload,
        reloadAll,
    }
}
