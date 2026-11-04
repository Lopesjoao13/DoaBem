import { BackLink } from '@/components/BackLink/BackLink.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { RecentDeliveriesNotice } from '@/components/DeliveryHistory/DeliveryHistory.jsx'
import { Field } from '@/components/Field/Field.jsx'
import { ItemLinesEditor } from '@/components/ItemLinesEditor/ItemLinesEditor.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { Select } from '@/components/Select/Select.jsx'
import { Stack } from '@/components/Stack/Stack.jsx'
import { REQUEST_MESSAGES } from '@/constants/requestMessages.js'
import { ROUTES } from '@/constants/routes.js'
import { TONES } from '@/constants/tones.js'
import { useRequestForm } from '@/hooks/useRequestForm.js'
import { Actions } from './NewRequestPage.styles.js'

const SELECT_FAMILY = { value: '', label: 'Selecione a família' }

const NewRequestPage = () => {
    const form = useRequestForm()
    const { values, errors, itemOptions } = form

    return (
        <>
            <BackLink to={ROUTES.REQUESTS}>Voltar para solicitações</BackLink>
            <PageHeader title="Nova solicitação" description={REQUEST_MESSAGES.createNotice} />
            {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
            <form onSubmit={form.submit} noValidate>
                <Stack>
                    <Panel title="Família" subtitle="Somente famílias ativas">
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
                    </Panel>
                    <Panel
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
                    </Panel>
                    <Actions>
                        <Button type="submit" disabled={form.isSubmitting || itemOptions.isLoading}>
                            {form.isSubmitting ? 'Criando...' : 'Criar solicitação'}
                        </Button>
                    </Actions>
                </Stack>
            </form>
        </>
    )
}

export default NewRequestPage
