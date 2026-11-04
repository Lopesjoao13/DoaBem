import { REQUEST_STATUS } from '@/constants/requestStatus.js'
import { formatDateTime } from '@/utils/formatters.js'
import { Detail, Event, EventTitle, Meta, StyledTimeline } from './RequestTimeline.styles.js'

const buildEvents = (request) => {
    const events = [
        {
            key: 'created',
            title: 'Criada (pendente)',
            at: request.createdAt,
            by: request.requestedBy,
        },
    ]
    if (request.decidedAt) {
        events.push({
            key: 'decided',
            title: request.status === REQUEST_STATUS.REJECTED ? 'Recusada' : 'Aprovada',
            at: request.decidedAt,
            by: request.decidedBy,
            detail: request.justification && `Justificativa: ${request.justification}`,
        })
    }
    if (request.pickedAt) {
        events.push({
            key: 'picked',
            title: 'Separada (itens reservados)',
            at: request.pickedAt,
            by: request.pickedBy,
        })
    }
    if (request.delivery) {
        events.push({
            key: 'delivered',
            title: 'Entregue',
            at: request.delivery.deliveredAt,
            by: request.delivery.deliveredBy,
            detail: request.delivery.notes && `Observação: ${request.delivery.notes}`,
        })
    }
    if (request.cancelledAt) {
        events.push({
            key: 'cancelled',
            title: 'Cancelada',
            at: request.cancelledAt,
            by: request.cancelledBy,
            detail: `Motivo: ${request.cancellationReason}`,
        })
    }
    return events
}

export const RequestTimeline = ({ request }) => (
    <StyledTimeline>
        {buildEvents(request).map((event) => (
            <Event key={event.key}>
                <EventTitle>{event.title}</EventTitle>
                <Meta>
                    {formatDateTime(event.at)} · {event.by}
                </Meta>
                {event.detail && <Detail>{event.detail}</Detail>}
            </Event>
        ))}
    </StyledTimeline>
)
