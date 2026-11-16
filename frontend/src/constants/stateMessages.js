import { IconAlertTriangle, IconClock, IconInbox, IconLoader2, IconLock } from '@tabler/icons-react'

export const STATE_VARIANTS = {
    LOADING: 'loading',
    EMPTY: 'empty',
    ERROR: 'error',
    DENIED: 'denied',
    UNAVAILABLE: 'unavailable',
}

export const STATE_PRESETS = {
    [STATE_VARIANTS.LOADING]: { icon: IconLoader2, title: 'Carregando...', role: 'status' },
    [STATE_VARIANTS.EMPTY]: {
        icon: IconInbox,
        title: 'Nenhum registro encontrado',
        role: undefined,
    },
    [STATE_VARIANTS.ERROR]: {
        icon: IconAlertTriangle,
        title: 'Não foi possível carregar',
        role: 'alert',
    },
    [STATE_VARIANTS.DENIED]: { icon: IconLock, title: 'Acesso negado', role: 'alert' },
    [STATE_VARIANTS.UNAVAILABLE]: { icon: IconClock, title: 'Em breve', role: undefined },
}
