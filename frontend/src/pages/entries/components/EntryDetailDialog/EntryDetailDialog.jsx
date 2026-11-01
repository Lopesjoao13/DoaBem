import { AsyncContent } from '@/components/AsyncContent/AsyncContent.jsx'
import { DescriptionList } from '@/components/DescriptionList/DescriptionList.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { FormSection } from '@/components/FormSection/FormSection.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { DIALOG_KINDS, DIALOG_SIZES } from '@/constants/dialog.js'
import { useEntryDetail } from '@/pages/entries/hooks/useEntryDetail.js'
import { describeEntrySource } from '@/utils/entries.js'
import { formatDate, formatDateTime } from '@/utils/formatters.js'
import { EntryItemsTable } from '@/pages/entries/components/EntryItemsTable/EntryItemsTable.jsx'

export const EntryDetailDialog = ({ entryId, onClose }) => {
    const { entry, error, reload } = useEntryDetail(entryId)

    return (
        <Dialog
            isOpen
            kind={DIALOG_KINDS.VIEW}
            size={DIALOG_SIZES.LG}
            title={`Entrada #${entryId}`}
            description={entry ? describeEntrySource(entry) : undefined}
            onClose={onClose}
        >
            <AsyncContent data={entry} error={error} onRetry={reload}>
                {(data) => (
                    <Stack gap={24}>
                        <FormSection title="Dados da entrada">
                            <DescriptionList
                                items={[
                                    { label: 'Data da entrada', value: formatDate(data.entryDate) },
                                    { label: 'Origem', value: describeEntrySource(data) },
                                    { label: 'Responsável', value: data.registeredBy },
                                    {
                                        label: 'Registrada em',
                                        value: formatDateTime(data.createdAt),
                                    },
                                    { label: 'Observação', value: data.notes },
                                ]}
                            />
                        </FormSection>
                        <FormSection
                            title="Itens"
                            subtitle="Correções são feitas por estorno no Histórico"
                        >
                            <Panel padded={false}>
                                <EntryItemsTable items={data.items} />
                            </Panel>
                        </FormSection>
                    </Stack>
                )}
            </AsyncContent>
        </Dialog>
    )
}
