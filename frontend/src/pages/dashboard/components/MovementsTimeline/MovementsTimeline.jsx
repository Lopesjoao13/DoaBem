import { Badge } from '@/components/Badge/Badge.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { TextLink } from '@/components/TextLink/TextLink.jsx'
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_TONES } from '@/constants/movementTypes.js'
import { ROUTES } from '@/constants/routes.js'
import { formatDate, formatQuantity, formatTime } from '@/utils/formatters.js'
import {
    Day,
    DayTitle,
    Description,
    Entry,
    Entries,
    Name,
    Time,
} from './MovementsTimeline.styles.js'
import { DATE_LENGTH } from '@/constants/dates.js'

const groupByDay = (movements) => [
    ...movements
        .reduce((groups, movement) => {
            const day = movement.occurredAt.slice(0, DATE_LENGTH)
            return groups.set(day, [...(groups.get(day) ?? []), movement])
        }, new Map())
        .entries(),
]

export const MovementsTimeline = ({ movements }) => (
    <Panel
        title="Últimas movimentações"
        subtitle="Entradas, entregas, ajustes e estornos"
        action={<TextLink to={ROUTES.MOVEMENTS}>Ver histórico</TextLink>}
    >
        {movements.length === 0 ? (
            <StateMessage
                title="Nenhuma movimentação"
                description="As entradas e entregas registradas aparecem aqui."
            />
        ) : (
            groupByDay(movements).map(([day, dayMovements]) => (
                <Day key={day}>
                    <DayTitle>{formatDate(day)}</DayTitle>
                    <Entries>
                        {dayMovements.map((movement) => (
                            <Entry key={movement.id}>
                                <Time>{formatTime(movement.occurredAt)}</Time>
                                <div>
                                    <Name>
                                        {movement.itemName} ·{' '}
                                        {formatQuantity(movement.quantity, movement.unitOfMeasure)}
                                    </Name>
                                    <Description>{movement.userName}</Description>
                                </div>
                                <Badge tone={MOVEMENT_TYPE_TONES[movement.type]}>
                                    {MOVEMENT_TYPE_LABELS[movement.type]}
                                </Badge>
                            </Entry>
                        ))}
                    </Entries>
                </Day>
            ))
        )}
    </Panel>
)
