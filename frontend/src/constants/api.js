export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const LIST_ALL_PARAMS = { page: 0, size: 1000 }
