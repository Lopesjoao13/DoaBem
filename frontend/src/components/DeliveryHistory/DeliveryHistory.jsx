import { generatePath } from 'react-router-dom'
import { Callout } from '@/components/Callout/Callout.jsx'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import { RECENT_DELIVERY_DAYS } from '@/constants/families.js'
import { ROUTES } from '@/constants/routes.js'
import { TONES } from '@/constants/tones.js'
import { formatDateTime, formatQuantity } from '@/utils/formatters.js'
import { DeliveryItem, DeliveryMeta, Items, List } from './DeliveryHistory.styles.js'

const describeItems = (items) =>
    items
        .map((item) => `${item.itemName} ${formatQuantity(item.quantity, item.unitOfMeasure)}`)
        .join(', ')

export const DeliveryList = ({ deliveries }) => (
    <List>
        {deliveries.map((delivery) => (
            <DeliveryItem key={delivery.id}>
                <DeliveryMeta>
                    <strong>{formatDateTime(delivery.deliveredAt)}</strong>
                    <span>por {delivery.deliveredBy}</span>
                    <TextLink to={generatePath(ROUTES.REQUEST_DETAIL, { id: delivery.requestId })}>
                        Solicitação #{delivery.requestId}
                    </TextLink>
                </DeliveryMeta>
                <Items>{describeItems(delivery.items)}</Items>
            </DeliveryItem>
        ))}
    </List>
)

export const RecentDeliveriesNotice = ({ summary }) => {
    if (!summary.lastDelivery) {
        return (
            <Callout tone={TONES.INFO} title="Última entrega: nenhuma">
                Esta família ainda não recebeu entregas.
            </Callout>
        )
    }

    return (
        <Callout
            tone={summary.recentDeliveries.length > 0 ? TONES.WARNING : TONES.INFO}
            title={`Última entrega: ${formatDateTime(summary.lastDelivery.deliveredAt)}`}
        >
            <span>
                {summary.recentDeliveries.length > 0
                    ? `${summary.recentDeliveries.length} entrega(s) nos últimos ${RECENT_DELIVERY_DAYS} dias. Isso não bloqueia a solicitação; serve de apoio à decisão.`
                    : `Nenhuma entrega nos últimos ${RECENT_DELIVERY_DAYS} dias.`}
            </span>
            {summary.recentDeliveries.length > 0 && (
                <DeliveryList deliveries={summary.recentDeliveries} />
            )}
        </Callout>
    )
}
