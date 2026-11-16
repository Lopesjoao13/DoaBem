import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { DiscardConfirm } from '@/components/DiscardConfirm/DiscardConfirm.jsx'
import { FormSection } from '@/components/FormSection/FormSection.jsx'
import { ItemLinesEditor } from '@/components/ItemLinesEditor/ItemLinesEditor.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { DIALOG_SIZES } from '@/constants/dialog.js'
import { ENTRY_MESSAGES } from '@/constants/entryMessages.js'
import { TONES } from '@/constants/tones.js'
import { useAuth } from '@/hooks/useAuth.js'
import { useDiscardGuard } from '@/hooks/useDiscardGuard.js'
import { useEntryForm } from '@/hooks/useEntryForm.js'
import { EntryHeaderFields } from '@/components/EntryDialog/components/EntryHeaderFields/EntryHeaderFields.jsx'
import { EntryReview } from '@/components/EntryDialog/components/EntryReview/EntryReview.jsx'

const EntryFooter = ({ form, onCancel }) => (
    <>
        <Button variant="outline" family="deny" onClick={onCancel} disabled={form.isSubmitting}>
            Cancelar
        </Button>
        {form.isReviewing ? (
            <>
                <Button variant="outline" onClick={form.backToEdit} disabled={form.isSubmitting}>
                    Voltar e editar
                </Button>
                <Button family="confirm" onClick={form.confirm} disabled={form.isSubmitting}>
                    {form.isSubmitting ? 'Gravando...' : 'Confirmar entrada'}
                </Button>
            </>
        ) : (
            <Button onClick={form.startReview} disabled={form.itemOptions.isLoading}>
                Revisar entrada
            </Button>
        )}
    </>
)

export const EntryDialog = ({ onClose, onSaved }) => {
    const { user } = useAuth()
    const form = useEntryForm({ onSaved })
    const guard = useDiscardGuard({ isDirty: form.isDirty, onClose })
    const { values, errors, itemOptions } = form

    return (
        <>
            <Dialog
                isOpen={!guard.isConfirmingDiscard}
                size={DIALOG_SIZES.LG}
                title={form.isReviewing ? 'Revisar entrada' : 'Nova entrada de doação'}
                description={ENTRY_MESSAGES.atomicNotice}
                onClose={guard.requestClose}
                footer={<EntryFooter form={form} onCancel={guard.requestClose} />}
            >
                <Stack gap={24}>
                    {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
                    {form.isReviewing ? (
                        <FormSection title="Confira antes de confirmar">
                            <EntryReview
                                values={values}
                                itemsById={itemOptions.itemsById}
                                userName={user.name}
                            />
                        </FormSection>
                    ) : (
                        <>
                            <FormSection
                                title="Dados da entrada"
                                subtitle="O responsável é registrado automaticamente"
                            >
                                <EntryHeaderFields
                                    values={values}
                                    errors={errors}
                                    onChange={form.handleChange}
                                />
                            </FormSection>
                            <FormSection
                                title="Itens recebidos"
                                subtitle="Itens em un aceitam só inteiros; kg e L, até 3 casas decimais"
                            >
                                <ItemLinesEditor
                                    lines={values.lines}
                                    errors={errors.lines}
                                    itemOptions={itemOptions.options}
                                    itemsById={itemOptions.itemsById}
                                    expiryHint={ENTRY_MESSAGES.expiryHint}
                                    onChange={form.changeLine}
                                    onAdd={form.addLine}
                                    onRemove={form.deleteLine}
                                />
                            </FormSection>
                        </>
                    )}
                </Stack>
            </Dialog>
            {guard.isConfirmingDiscard && (
                <DiscardConfirm onKeepEditing={guard.keepEditing} onDiscard={guard.discard} />
            )}
        </>
    )
}
