import { IconAdjustmentsHorizontal, IconChevronRight } from '@tabler/icons-react'
import { IconButton } from '@/components/IconButton/IconButton.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import { PERMISSIONS } from '@/constants/permissions.js'
import { ROUTES } from '@/constants/routes.js'
import { useDisclosure } from '@/hooks/useDisclosure.js'
import { usePermission } from '@/hooks/usePermission.js'
import { AdjustmentDialog } from '@/components/AdjustmentDialog/AdjustmentDialog.jsx'
import { formatDate, formatQuantity } from '@/utils/formatters.js'
import { buildRequestLink } from '@/utils/links.js'
import {
    Actions,
    Description,
    List,
    ListItem,
    Section,
    SectionHeader,
    SectionTitle,
    Strong,
} from './AttentionPanel.styles.js'

const CriticalItems = ({ items, canAdjust, onAdjust }) => (
    <Section>
        <SectionHeader>
            <SectionTitle>Itens críticos</SectionTitle>
            <TextLink to={ROUTES.STOCK}>Ver estoque</TextLink>
        </SectionHeader>
        <List>
            {items.map((item) => (
                <ListItem key={item.itemId}>
                    <div>
                        <Strong>{item.name}</Strong>
                        <Description>
                            {formatQuantity(item.available, item.unitOfMeasure)} disponível · mínimo{' '}
                            {formatQuantity(item.minStock, item.unitOfMeasure)}
                        </Description>
                    </div>
                    {canAdjust && (
                        <Actions>
                            <IconButton
                                icon={IconAdjustmentsHorizontal}
                                label="Ajustar saldo"
                                onClick={() => onAdjust(item.itemId)}
                            />
                        </Actions>
                    )}
                </ListItem>
            ))}
        </List>
    </Section>
)

const PendingRequests = ({ requests }) => (
    <Section>
        <SectionHeader>
            <SectionTitle>Solicitações pendentes</SectionTitle>
            <TextLink to={ROUTES.REQUESTS}>Ver solicitações</TextLink>
        </SectionHeader>
        <List>
            {requests.map((request) => (
                <ListItem key={request.id}>
                    <div>
                        <Strong>
                            #{request.id} · {request.beneficiaryName}
                        </Strong>
                        <Description>
                            {request.itemCount} {request.itemCount === 1 ? 'item' : 'itens'} ·
                            criada em {formatDate(request.createdAt)}
                        </Description>
                    </div>
                    <Actions>
                        <IconButton
                            icon={IconChevronRight}
                            label="Analisar solicitação"
                            to={buildRequestLink(request.id)}
                        />
                    </Actions>
                </ListItem>
            ))}
        </List>
    </Section>
)

export const AttentionPanel = ({ criticalItems, pendingRequests, onChanged }) => {
    const adjustment = useDisclosure()
    const canAdjust = usePermission(PERMISSIONS.ADJUST_STOCK)
    const isEmpty = criticalItems.length === 0 && pendingRequests.length === 0

    const handleSaved = () => {
        adjustment.close()
        onChanged()
    }

    return (
        <Panel title="Precisa de atenção" subtitle="O que exige uma ação agora">
            {isEmpty ? (
                <StateMessage
                    title="Tudo em dia"
                    description="Nenhum item crítico e nenhuma solicitação pendente."
                />
            ) : (
                <>
                    {criticalItems.length > 0 && (
                        <CriticalItems
                            items={criticalItems}
                            canAdjust={canAdjust}
                            onAdjust={adjustment.open}
                        />
                    )}
                    {pendingRequests.length > 0 && <PendingRequests requests={pendingRequests} />}
                </>
            )}
            {adjustment.isOpen && (
                <AdjustmentDialog
                    initialItemId={adjustment.payload}
                    onClose={adjustment.close}
                    onSaved={handleSaved}
                />
            )}
        </Panel>
    )
}
