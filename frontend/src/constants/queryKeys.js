export const QUERY_KEYS = {
    USERS: 'users',
    USER_OPTIONS: 'user-options',
    CATEGORIES: 'categories',
    ITEMS: 'items',
    BENEFICIARIES: 'beneficiaries',
    ENTRIES: 'entries',
    STOCK: 'stock',
    MOVEMENTS: 'movements',
    REQUESTS: 'requests',
    DASHBOARD: 'dashboard',
    DELIVERY_SUMMARY: 'delivery-summary',
    FAMILY_HISTORY: 'family-history',
}

// Quanto tempo uma consulta é considerada atual (sem refazer a requisição).
export const STALE_TIME = {
    // Dados de referência que mudam pouco (categorias, itens, opções de usuário).
    REFERENCE: 5 * 60_000,
    // Listas e detalhes operacionais (padrão do queryClient).
    DEFAULT: 30_000,
}

// Consultas afetadas por cada tipo de escrita (evita refazer tudo a cada mutação).
export const INVALIDATES = {
    USERS: [QUERY_KEYS.USERS, QUERY_KEYS.USER_OPTIONS],
    CATALOG: [QUERY_KEYS.CATEGORIES, QUERY_KEYS.ITEMS, QUERY_KEYS.STOCK],
    FAMILIES: [QUERY_KEYS.BENEFICIARIES],
    STOCK_CHANGE: [
        QUERY_KEYS.STOCK,
        QUERY_KEYS.MOVEMENTS,
        QUERY_KEYS.DASHBOARD,
        QUERY_KEYS.ENTRIES,
        QUERY_KEYS.REQUESTS,
    ],
    REQUEST_CHANGE: [
        QUERY_KEYS.REQUESTS,
        QUERY_KEYS.STOCK,
        QUERY_KEYS.MOVEMENTS,
        QUERY_KEYS.DASHBOARD,
        QUERY_KEYS.FAMILY_HISTORY,
        QUERY_KEYS.DELIVERY_SUMMARY,
    ],
}
