import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/Button/Button.jsx'
import { DataTable } from '@/components/DataTable/DataTable.jsx'
import { DEFAULT_PAGE_SIZE } from '@/constants/pagination.js'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { useAuth } from '@/hooks/useAuth.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useUsers } from '@/pages/users/hooks/useUsers.js'
import { UsersToolbar } from '@/pages/users/components/UsersToolbar/UsersToolbar.jsx'
import { UserActionConfirm } from '@/pages/users/components/UserActionConfirm/UserActionConfirm.jsx'
import { UserDialog } from '@/pages/users/components/UserDialog/UserDialog.jsx'
import { buildUsersColumns, isSameUser } from '@/pages/users/constants/usersColumns.jsx'

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
            <UsersToolbar
                filters={users.filters}
                isFiltered={users.isFiltered}
                onChange={users.handleFilterChange}
                onClear={users.clearFilters}
            />
            <Panel padded={false}>
                <DataTable
                    pageSize={DEFAULT_PAGE_SIZE}
                    columns={buildUsersColumns({
                        currentEmail: currentUser.email,
                        onEdit: userDialog.open,
                        onToggleActive: statusConfirm.open,
                    })}
                    rows={users.users}
                    isLoading={users.isLoading}
                    error={users.error}
                    onRetry={users.reload}
                    emptyTitle="Nenhum usuário encontrado"
                    emptyDescription="Ajuste os filtros para ver outros usuários."
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
