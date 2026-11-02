import { formatDateTime } from '@/utils/formatters.js'
import { Detail, Event, EventTitle, Meta, StyledTimeline } from './RequestTimeline.styles.js'
import { buildRequestEvents } from '@/pages/requests/constants/requestEvents.jsx'

export const RequestTimeline = ({ request }) => (
    <StyledTimeline>
        {buildRequestEvents(request).map((event) => (
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
