import { useCallback, useState } from 'react'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { useFetch } from '@/hooks/useFetch.js'
import { listCategories, listItems } from '@/services/catalogService.js'

const EMPTY_ROWS = []

export const useCatalog = () => {
    const [itemStatus, setItemStatus] = useState(RECORD_STATUS.ACTIVE)

    const loadItems = useCallback(() => listItems({ status: itemStatus }), [itemStatus])
    const items = useFetch(loadItems)
    const categories = useFetch(listCategories)

    const changeItemStatus = (value) => {
        setItemStatus(value)
    }

    const reloadAll = useCallback(() => {
        items.reload()
        categories.reload()
    }, [items, categories])

    return {
        items: items.data?.content ?? EMPTY_ROWS,
        itemsError: items.error,
        isLoadingItems: items.isLoading && !items.data,
        categories: categories.data?.content ?? EMPTY_ROWS,
        categoriesError: categories.error,
        isLoadingCategories: categories.isLoading && !categories.data,
        itemStatus,
        changeItemStatus,
        reloadItems: items.reload,
        reloadCategories: categories.reload,
        reloadAll,
    }
}
