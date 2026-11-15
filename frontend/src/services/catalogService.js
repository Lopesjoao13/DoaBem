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
} from '@/services/mock/mockCatalog.js'

const api = {
    listCategories: (filters) => httpClient.get('/categories', { ...LIST_ALL_PARAMS, ...filters }),
    getCategory: (id) => httpClient.get(`/categories/${id}`),
    createCategory: (category) => httpClient.post('/categories', category),
    updateCategory: (id, category) => httpClient.put(`/categories/${id}`, category),
    setCategoryActive: (id, active) => httpClient.patch(`/categories/${id}/status`, { active }),
    listItems: (filters) => httpClient.get('/items', { ...LIST_ALL_PARAMS, ...filters }),
    getItem: (id) => httpClient.get(`/items/${id}`),
    createItem: (item) => httpClient.post('/items', item),
    updateItem: (id, item) => httpClient.put(`/items/${id}`, item),
    setItemStatus: (id, status) => httpClient.patch(`/items/${id}/status`, { status }),
}

const mock = {
    listCategories: (filters) => mockListCategories({ ...LIST_ALL_PARAMS, ...filters }),
    getCategory: (id) =>
        mockListCategories(LIST_ALL_PARAMS).then(({ content }) =>
            content.find((category) => category.id === Number(id)),
        ),
    createCategory: mockCreateCategory,
    updateCategory: mockUpdateCategory,
    setCategoryActive: mockSetCategoryActive,
    listItems: (filters) => mockListItems({ ...LIST_ALL_PARAMS, ...filters }),
    getItem: (id) =>
        mockListItems(LIST_ALL_PARAMS).then(({ content }) =>
            content.find((item) => item.id === Number(id)),
        ),
    createItem: mockCreateItem,
    updateItem: mockUpdateItem,
    setItemStatus: mockSetItemStatus,
}

export const {
    listCategories,
    getCategory,
    createCategory,
    updateCategory,
    setCategoryActive,
    listItems,
    getItem,
    createItem,
    updateItem,
    setItemStatus,
} = USE_MOCK ? mock : api
