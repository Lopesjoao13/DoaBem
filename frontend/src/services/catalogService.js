import { LIST_ALL_PARAMS, USE_MOCK } from '@/constants/api.js'
import { httpClient } from './httpClient.js'
import {
    mockCreateCategory,
    mockCreateItem,
    mockListCategories,
    mockListItems,
    mockSetCategoryActive,
    mockSetItemStatus,
    mockUpdateCategory,
    mockUpdateItem,
} from './mock/mockCatalog.js'

const api = {
    listCategories: (filters) => httpClient.get('/categories', { ...LIST_ALL_PARAMS, ...filters }),
    createCategory: (category) => httpClient.post('/categories', category),
    updateCategory: (id, category) => httpClient.put(`/categories/${id}`, category),
    setCategoryActive: (id, active) => httpClient.patch(`/categories/${id}/status`, { active }),
    listItems: (filters) => httpClient.get('/items', { ...LIST_ALL_PARAMS, ...filters }),
    createItem: (item) => httpClient.post('/items', item),
    updateItem: (id, item) => httpClient.put(`/items/${id}`, item),
    setItemStatus: (id, status) => httpClient.patch(`/items/${id}/status`, { status }),
}

const mock = {
    listCategories: (filters) => mockListCategories({ ...LIST_ALL_PARAMS, ...filters }),
    createCategory: mockCreateCategory,
    updateCategory: mockUpdateCategory,
    setCategoryActive: mockSetCategoryActive,
    listItems: (filters) => mockListItems({ ...LIST_ALL_PARAMS, ...filters }),
    createItem: mockCreateItem,
    updateItem: mockUpdateItem,
    setItemStatus: mockSetItemStatus,
}

export const {
    listCategories,
    createCategory,
    updateCategory,
    setCategoryActive,
    listItems,
    createItem,
    updateItem,
    setItemStatus,
} = USE_MOCK ? mock : api
