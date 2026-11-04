import { BackLink } from '@/components/BackLink/BackLink.jsx'
import { Button } from '@/components/Button/Button.jsx'
import { Callout } from '@/components/Callout/Callout.jsx'
import { ItemLinesEditor } from '@/components/ItemLinesEditor/ItemLinesEditor.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { ENTRY_MESSAGES } from '@/constants/entryMessages.js'
import { ROUTES } from '@/constants/routes.js'
import { TONES } from '@/constants/tones.js'
import { useAuth } from '@/hooks/useAuth.js'
import { useEntryForm } from '@/hooks/useEntryForm.js'
import { EntryHeaderFields } from './components/EntryHeaderFields/EntryHeaderFields.jsx'
import { EntryReview } from './components/EntryReview/EntryReview.jsx'
import { Actions } from './NewEntryPage.styles.js'

const NewEntryPage = () => {
    const { user } = useAuth()
    const form = useEntryForm()
    const { values, errors, itemOptions } = form

    return (
        <>
            <BackLink to={ROUTES.ENTRIES}>Voltar para entradas</BackLink>
            <PageHeader
                title={form.isReviewing ? 'Revisar entrada' : 'Nova entrada de doação'}
                description={ENTRY_MESSAGES.atomicNotice}
            />
            {form.formError && <Callout tone={TONES.CRITICAL}>{form.formError}</Callout>}
            {form.isReviewing ? (
                <Panel title="Confira antes de confirmar">
                    <EntryReview
                        values={values}
                        itemsById={itemOptions.itemsById}
                        userName={user.name}
                    />
                </Panel>
            ) : (
                <>
                    <Panel
                        title="Dados da entrada"
                        subtitle="O responsável é registrado automaticamente"
                    >
                        <EntryHeaderFields
                            values={values}
                            errors={errors}
                            onChange={form.handleChange}
                        />
                    </Panel>
                    <Panel
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
                    </Panel>
                </>
            )}
            <Actions>
                {form.isReviewing ? (
                    <>
                        <Button
                            variant="outline"
                            onClick={form.backToEdit}
                            disabled={form.isSubmitting}
                        >
                            Voltar e editar
                        </Button>
                        <Button
                            family="confirm"
                            onClick={form.confirm}
                            disabled={form.isSubmitting}
                        >
                            {form.isSubmitting ? 'Gravando...' : 'Confirmar entrada'}
                        </Button>
                    </>
                ) : (
                    <Button onClick={form.startReview} disabled={itemOptions.isLoading}>
                        Revisar entrada
                    </Button>
                )}
            </Actions>
        </>
    )
}

export default NewEntryPage
