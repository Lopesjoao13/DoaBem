import { IconPencil, IconUserCheck, IconUserOff } from '@tabler/icons-react'
import { Badge } from '@/components/Badge/Badge.jsx'
import { IconButton } from '@/components/IconButton/IconButton.jsx'
import { RowActions } from '@/components/RowActions/RowActions.jsx'
import {
    RECORD_STATUS,
    RECORD_STATUS_LABELS,
    RECORD_STATUS_TONES,
} from '@/constants/recordStatus.js'
import { ROLE_LABELS } from '@/constants/roles.js'
import { formatDate } from '@/utils/formatters.js'

export const toUserStatus = (active) => (active ? RECORD_STATUS.ACTIVE : RECORD_STATUS.INACTIVE)
export const isSameUser = (user, email) => user?.email.toLowerCase() === email
export const buildUsersColumns = ({ currentEmail, onEdit, onToggleActive }) => [
    { key: 'name', header: 'Nome', sortValue: (row) => row.name },
    { key: 'email', header: 'E-mail', sortValue: (row) => row.email },
    {
        key: 'role',
        header: 'Perfil',
        sortValue: (row) => ROLE_LABELS[row.role],
        render: (row) => ROLE_LABELS[row.role],
    },
    {
        key: 'active',
        header: 'Status',
        sortValue: (row) => Number(row.active),
        render: (row) => (
            <Badge tone={RECORD_STATUS_TONES[toUserStatus(row.active)]}>
                {RECORD_STATUS_LABELS[toUserStatus(row.active)]}
            </Badge>
        ),
    },
    {
        key: 'createdAt',
        header: 'Criado em',
        noWrap: true,
        sortValue: (row) => row.createdAt,
        render: (row) => formatDate(row.createdAt),
    },
    {
        key: 'actions',
        header: 'Ações',
        render: (row) => (
            <RowActions>
                <IconButton icon={IconPencil} label="Editar" onClick={() => onEdit(row)} />
                {!isSameUser(row, currentEmail) && (
                    <IconButton
                        icon={row.active ? IconUserOff : IconUserCheck}
                        label={row.active ? 'Desativar' : 'Reativar'}
                        tone={row.active ? 'deny' : 'confirm'}
                        onClick={() => onToggleActive(row)}
                    />
                )}
            </RowActions>
        ),
    },
]
