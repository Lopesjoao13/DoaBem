import { IconPlus } from '@tabler/icons-react'
import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { RowActions } from '@/components/RowActions/RowActions.jsx'
import {
    RECORD_STATUS,
    RECORD_STATUS_LABELS,
    RECORD_STATUS_TONES,
} from '@/constants/recordStatus.js'
import { ROLE_LABELS } from '@/constants/roles.js'
import { useAuth } from '@/hooks/useAuth.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useUsers } from '@/hooks/useUsers.js'
import { formatDate } from '@/utils/formatters.js'
import { UserActionConfirm } from './components/UserActionConfirm/UserActionConfirm.jsx'
import { UserDialog } from './components/UserDialog/UserDialog.jsx'

const toStatus = (active) => (active ? RECORD_STATUS.ACTIVE : RECORD_STATUS.INACTIVE)

const isSameUser = (user, email) => user?.email.toLowerCase() === email

const buildColumns = ({ currentEmail, onEdit, onToggleActive }) => [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    { key: 'role', header: 'Perfil', render: (row) => ROLE_LABELS[row.role] },
    {
        key: 'active',
        header: 'Status',
        render: (row) => (
            <Badge tone={RECORD_STATUS_TONES[toStatus(row.active)]}>
                {RECORD_STATUS_LABELS[toStatus(row.active)]}
            </Badge>
        ),
    },
    {
        key: 'createdAt',
        header: 'Criado em',
        noWrap: true,
        render: (row) => formatDate(row.createdAt),
    },
    {
        key: 'actions',
        header: 'Ações',
        align: 'right',
        render: (row) => (
            <RowActions>
                <Button variant="text" size="sm" onClick={() => onEdit(row)}>
                    Editar
                </Button>
                {!isSameUser(row, currentEmail) && (
                    <Button
                        variant="text"
                        size="sm"
                        family={row.active ? 'deny' : 'confirm'}
                        onClick={() => onToggleActive(row)}
                    >
                        {row.active ? 'Desativar' : 'Reativar'}
                    </Button>
                )}
            </RowActions>
        ),
    },
]

const UsersPage = () => {
    const { user: currentUser } = useAuth()
    const users = useUsers()
    const userDialog = useDisclosure()
    const statusConfirm = useDisclosure()

    const handleDone = (dialog) => () => {
        dialog.close()
        users.reload()
    }

    return (
        <>
            <PageHeader
                title="Usuários"
                description="Usuários internos com perfil Operador ou Coordenador. Usuário inativo não consegue entrar."
                actions={
                    <Button onClick={() => userDialog.open()}>
                        <IconPlus size={18} stroke={2} />
                        Novo usuário
                    </Button>
                }
            />
            <Panel padded={false}>
                <DataTable
                    columns={buildColumns({
                        currentEmail: currentUser.email,
                        onEdit: userDialog.open,
                        onToggleActive: statusConfirm.open,
                    })}
                    rows={users.users}
                    isLoading={users.isLoading}
                    error={users.error}
                    onRetry={users.reload}
                    emptyTitle="Nenhum usuário"
                />
            </Panel>
            {userDialog.isOpen && (
                <UserDialog
                    user={userDialog.payload}
                    isSelf={isSameUser(userDialog.payload, currentUser.email)}
                    onClose={userDialog.close}
                    onSaved={handleDone(userDialog)}
                />
            )}
            {statusConfirm.isOpen && (
                <UserActionConfirm
                    user={statusConfirm.payload}
                    onClose={statusConfirm.close}
                    onDone={handleDone(statusConfirm)}
                />
            )}
        </>
    )
}

export default UsersPage
