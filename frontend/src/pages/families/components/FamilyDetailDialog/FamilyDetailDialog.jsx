import { IconPlus } from '@tabler/icons-react'
import { AsyncContent } from '@/components/AsyncContent/AsyncContent.jsx'
import { Badge } from '@/components/Badge/Badge.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { DescriptionList } from '@/components/DescriptionList/DescriptionList.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { FormSection } from '@/components/FormSection/FormSection.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { DIALOG_KINDS, DIALOG_SIZES } from '@/constants/dialog.js'
import { FEATURES } from '@/constants/features.js'
import {
    RECORD_STATUS,
    RECORD_STATUS_LABELS,
    RECORD_STATUS_TONES,
} from '@/constants/recordStatus.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { useFamilyDetail } from '@/pages/families/hooks/useFamilyDetail.js'
import { RequestDialog } from '@/components/RequestDialog/RequestDialog.jsx'
import { formatDateTime } from '@/utils/formatters.js'
import { FamilyDialog } from '@/pages/families/components/FamilyDialog/FamilyDialog.jsx'
import { FamilyHistory } from '@/pages/families/components/FamilyHistory/FamilyHistory.jsx'
import { FamilyStatusConfirm } from '@/pages/families/components/FamilyStatusConfirm/FamilyStatusConfirm.jsx'
import { FAMILY_ACTIONS } from '@/pages/families/constants/familyActions.js'

const describeHousehold = (family) =>
    `${family.householdSize} integrante(s)${family.neighborhood ? ` · ${family.neighborhood}` : ''}`

const FamilyActions = ({ family, onOpen }) => {
    const isActive = family.status === RECORD_STATUS.ACTIVE
    return (
        <>
            <Button variant="outline" onClick={() => onOpen(FAMILY_ACTIONS.EDIT)}>
                Editar
            </Button>
            <Button
                variant="outline"
                family={isActive ? 'deny' : 'confirm'}
                onClick={() => onOpen(FAMILY_ACTIONS.STATUS)}
            >
                {isActive ? 'Inativar' : 'Reativar'}
            </Button>
            {isActive && FEATURES.REQUESTS && (
                <Button onClick={() => onOpen(FAMILY_ACTIONS.REQUEST)}>
                    <IconPlus size={18} stroke={2} />
                    Nova solicitação
                </Button>
            )}
        </>
    )
}

const FamilyBody = ({ data }) => (
    <Stack gap={32}>
        <FormSection title="Cadastro">
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
                    { label: 'Cadastrada em', value: formatDateTime(data.createdAt) },
                    { label: 'Observações', value: data.notes },
                ]}
            />
        </FormSection>
        {FEATURES.REQUESTS && <FamilyHistory familyId={data.id} />}
    </Stack>
)

export const FamilyDetailDialog = ({ familyId, onClose, onChanged }) => {
    const { family, error, reload } = useFamilyDetail(familyId)
    const action = useDisclosure()

    const handleDone = () => {
        action.close()
        reload()
        onChanged()
    }

    if (action.isOpen && family) {
        if (action.payload === FAMILY_ACTIONS.EDIT) {
            return <FamilyDialog family={family} onClose={action.close} onSaved={handleDone} />
        }
        if (action.payload === FAMILY_ACTIONS.STATUS) {
            return (
                <FamilyStatusConfirm
                    family={family}
                    onClose={action.close}
                    onChanged={handleDone}
                />
            )
        }
        return (
            <RequestDialog
                familyId={String(family.id)}
                onClose={action.close}
                onSaved={handleDone}
            />
        )
    }

    return (
        <Dialog
            isOpen
            kind={DIALOG_KINDS.VIEW}
            size={DIALOG_SIZES.LG}
            title={family ? `${family.responsibleName} · #${family.id}` : `Família #${familyId}`}
            description={family ? describeHousehold(family) : ''}
            onClose={onClose}
            footer={family && <FamilyActions family={family} onOpen={action.open} />}
        >
            <AsyncContent data={family} error={error} onRetry={reload}>
                {(data) => <FamilyBody data={data} />}
            </AsyncContent>
        </Dialog>
    )
}
