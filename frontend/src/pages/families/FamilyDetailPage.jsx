import { IconPlus } from '@tabler/icons-react'
import { useNavigate, useParams } from 'react-router-dom'
import { AsyncContent } from '@/components/AsyncContent/AsyncContent.jsx'
import { BackLink } from '@/components/BackLink/BackLink.jsx'
import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { DescriptionList } from '@/components/DescriptionList/DescriptionList.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { FEATURES } from '@/constants/features.js'
import {
    RECORD_STATUS,
    RECORD_STATUS_LABELS,
    RECORD_STATUS_TONES,
} from '@/constants/recordStatus.js'
import { ROUTES } from '@/constants/routes.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useFamilyDetail } from '@/hooks/useFamilyDetail.js'
import { formatDateTime } from '@/utils/formatters.js'
import { FamilyDialog } from './components/FamilyDialog/FamilyDialog.jsx'
import { FamilyHistory } from './components/FamilyHistory/FamilyHistory.jsx'
import { FamilyStatusConfirm } from './components/FamilyStatusConfirm/FamilyStatusConfirm.jsx'

const FamilyDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { family, error, reload } = useFamilyDetail(id)
    const editDialog = useDisclosure()
    const statusConfirm = useDisclosure()

    const handleSaved = () => {
        editDialog.close()
        reload()
    }

    const handleStatusChanged = () => {
        statusConfirm.close()
        reload()
    }

    return (
        <>
            <BackLink to={ROUTES.FAMILIES}>Voltar para famílias</BackLink>
            <AsyncContent data={family} error={error} onRetry={reload}>
                {(data) => {
                    const isActive = data.status === RECORD_STATUS.ACTIVE
                    return (
                        <>
                            <PageHeader
                                title={`${data.responsibleName} · #${data.id}`}
                                description={`${data.householdSize} integrante(s)${data.neighborhood ? ` · ${data.neighborhood}` : ''}`}
                                actions={
                                    <>
                                        <Button variant="outline" onClick={() => editDialog.open()}>
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            family={isActive ? 'deny' : 'confirm'}
                                            onClick={() => statusConfirm.open()}
                                        >
                                            {isActive ? 'Inativar' : 'Reativar'}
                                        </Button>
                                        {isActive && FEATURES.REQUESTS && (
                                            <Button
                                                onClick={() =>
                                                    navigate(
                                                        `${ROUTES.REQUEST_NEW}?familyId=${data.id}`,
                                                    )
                                                }
                                            >
                                                <IconPlus size={18} stroke={2} />
                                                Nova solicitação
                                            </Button>
                                        )}
                                    </>
                                }
                            />
                            <Panel title="Cadastro">
                                <DescriptionList
                                    items={[
                                        {
                                            label: 'Situação',
                                            value: (
                                                <Badge tone={RECORD_STATUS_TONES[data.status]}>
                                                    {RECORD_STATUS_LABELS[data.status]}
                                                </Badge>
                                            ),
                                        },
                                        { label: 'Telefone', value: data.phone },
                                        { label: 'Bairro / localidade', value: data.neighborhood },
                                        { label: 'Integrantes', value: String(data.householdSize) },
                                        {
                                            label: 'Cadastrada em',
                                            value: formatDateTime(data.createdAt),
                                        },
                                        { label: 'Observações', value: data.notes },
                                    ]}
                                />
                            </Panel>
                            {FEATURES.REQUESTS && <FamilyHistory familyId={data.id} />}
                            {editDialog.isOpen && (
                                <FamilyDialog
                                    family={data}
                                    onClose={editDialog.close}
                                    onSaved={handleSaved}
                                />
                            )}
                            {statusConfirm.isOpen && (
                                <FamilyStatusConfirm
                                    family={data}
                                    onClose={statusConfirm.close}
                                    onChanged={handleStatusChanged}
                                />
                            )}
                        </>
                    )
                }}
            </AsyncContent>
        </>
    )
}

export default FamilyDetailPage
