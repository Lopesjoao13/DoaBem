import {
    IconClipboardList,
    IconDownload,
    IconHistory,
    IconLayoutDashboard,
    IconPackage,
    IconTag,
    IconUserShield,
    IconUsers,
} from '@tabler/icons-react'
import { PERMISSIONS } from './permissions.js'
import { ROUTES } from './routes.js'

export const SIDEBAR_GROUPS = [
    {
        title: 'Operação',
        items: [
            { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: IconLayoutDashboard },
            { label: 'Estoque', path: ROUTES.STOCK, icon: IconPackage },
            { label: 'Entradas de doação', path: ROUTES.ENTRIES, icon: IconDownload },
            { label: 'Solicitações', path: ROUTES.REQUESTS, icon: IconClipboardList },
            { label: 'Famílias', path: ROUTES.FAMILIES, icon: IconUsers },
            { label: 'Movimentações', path: ROUTES.MOVEMENTS, icon: IconHistory },
        ],
    },
    {
        title: 'Administração',
        items: [
            { label: 'Itens e categorias', path: ROUTES.ITEMS, icon: IconTag },
            {
                label: 'Usuários',
                path: ROUTES.USERS,
                icon: IconUserShield,
                allowedRoles: PERMISSIONS.MANAGE_USERS,
            },
        ],
    },
]
