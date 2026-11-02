import { useId } from 'react'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { RecentDeliveriesNotice } from '@/components/DeliveryHistory/DeliveryHistory.jsx'
import { Dialog } from '@/components/Dialog/Dialog.jsx'
import { DiscardConfirm } from '@/components/DiscardConfirm/DiscardConfirm.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { FormSection } from '@/components/FormSection/FormSection.jsx'
import { ItemLinesEditor } from '@/components/ItemLinesEditor/ItemLinesEditor.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { DIALOG_SIZES } from '@/constants/dialog.js'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import { TONES } from '@/constants/tones.js'
import { useDiscardGuard } from '@/hooks/useDiscardGuard.js'
import { useRequestForm } from '@/hooks/useRequestForm.js'
import { SELECT_FAMILY } from '@/constants/formPlaceholders.js'

export const RequestDialog = ({ familyId, onClose, onSaved }) => {
    const formId = useId()
    const form = useRequestForm({ familyId, onSaved })
    const guard = useDiscardGuard({ isDirty: form.isDirty, onClose })
    const { values, errors, itemOptions } = form

    return (
        <>
            <Dialog
                isOpen={!guard.isConfirmingDiscard}
                size={DIALOG_SIZES.LG}
                title="Nova solicitação"
                description={REQUEST_MESSAGES.createNotice}
                onClose={guard.requestClose}
                footer={
                    <>
                        <Button
                            variant="outline"
                            family="deny"
                            onClick={guard.requestClose}
                            disabled={form.isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            form={formId}
                            disabled={form.isSubmitting || itemOptions.isLoading}
                        >
                            {form.isSubmitting ? 'Criando...' : 'Criar solicitação'}
                        </Button>
                    </>
                }
            >
                <form id={formId} onSubmit={form.submit} noValidate>
                    <Stack gap={24}>
                        {form.formError && (
                            <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>
                        )}
                        <FormSection title="Família" subtitle="Somente famílias ativas">
                            <Stack>
                                <Field
                                    label="Família / responsável"
                                    htmlFor="request-family"
                                    error={errors.beneficiaryId}
                                >
                                    <Select
                                        id="request-family"
                                        name="beneficiaryId"
                                        value={values.beneficiaryId}
                                        onChange={form.handleChange}
                                        options={form.familyOptions}
                                        placeholder={SELECT_FAMILY}
                                        error={errors.beneficiaryId}
                                        disabled={form.isLoadingFamilies}
                                    />
                                </Field>
                                {form.deliverySummary && (
                                    <RecentDeliveriesNotice summary={form.deliverySummary} />
                                )}
                            </Stack>
                        </FormSection>
                        <FormSection
                            title="Itens solicitados"
                            subtitle="Somente itens ativos; o disponível é só referência"
                        >
                            <ItemLinesEditor
                                lines={values.lines}
                                errors={errors.lines}
                                itemOptions={itemOptions.options}
                                itemsById={itemOptions.itemsById}
                                quantityField="requestedQty"
                                showAvailable
                                onChange={form.changeLine}
                                onAdd={form.addLine}
                                onRemove={form.deleteLine}
                            />
                        </FormSection>
                    </Stack>
                </form>
            </Dialog>
            {guard.isConfirmingDiscard && (
                <DiscardConfirm onKeepEditing={guard.keepEditing} onDiscard={guard.discard} />
            )}
        </>
    )
}
