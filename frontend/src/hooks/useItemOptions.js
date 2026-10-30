import { useMemo } from 'react'
import { RECORD_STATUS } from '@/constants/recordStatus.js'
import { useFetch } from '@/hooks/useFetch.js'
import { listItems } from '@/services/catalogService.js'
import { getStock } from '@/services/stockService.js'

const EMPTY_ROWS = []

const loadCatalogItems = async () => {
    const page = await listItems({ status: RECORD_STATUS.ACTIVE })
    return page.content.map((item) => ({ ...item, itemId: item.id }))
}

const loadStockItems = () => getStock({ status: RECORD_STATUS.ACTIVE })

export const useItemOptions = ({ withStock = false } = {}) => {
    const { data, isLoading, error } = useFetch(withStock ? loadStockItems : loadCatalogItems)
    const items = data ?? EMPTY_ROWS

    const itemsById = useMemo(
        () => new Map(items.map((item) => [String(item.itemId), item])),
        [items],
    )
    const options = useMemo(
        () => items.map((item) => ({ value: String(item.itemId), label: item.name })),
        [items],
    )

    return { items, itemsById, options, isLoading, error }
}
