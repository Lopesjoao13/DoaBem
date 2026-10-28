import { useParams } from 'react-router-dom'
import { AsyncContent } from '@/components/AsyncContent/AsyncContent.jsx'
import { BackLink } from '@/components/BackLink/BackLink.jsx'
import { DescriptionList } from '@/components/DescriptionList/DescriptionList.jsx'
import { PageHeader } from '@/components/PageHeader/PageHeader.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { ROUTES } from '@/constants/routes.js'
import { useEntryDetail } from '@/hooks/useEntryDetail.js'
import { describeEntrySource } from '@/utils/entries.js'
import { formatDate, formatDateTime } from '@/utils/formatters.js'
import { EntryItemsTable } from './components/EntryItemsTable/EntryItemsTable.jsx'

const EntryDetailPage = () => {
    const { id } = useParams()
    const { entry, error, reload } = useEntryDetail(id)

    return (
        <>
            <BackLink to={ROUTES.ENTRIES}>Voltar para entradas</BackLink>
            <AsyncContent data={entry} error={error} onRetry={reload}>
                {(data) => (
                    <>
                        <PageHeader
                            title={`Entrada #${data.id}`}
                            description={describeEntrySource(data)}
                        />
                        <Panel title="Dados da entrada">
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
                        </Panel>
                        <Panel
                            title="Itens"
                            subtitle="Correções são feitas por estorno em Movimentações"
                            padded={false}
                        >
                            <EntryItemsTable items={data.items} />
                        </Panel>
                    </>
                )}
            </AsyncContent>
        </>
    )
}

export default EntryDetailPage
