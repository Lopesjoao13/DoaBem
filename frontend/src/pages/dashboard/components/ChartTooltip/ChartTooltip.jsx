import { Key, Label, TooltipBox, Value } from './ChartTooltip.styles.js'

export const ChartTooltip = ({ value, label, color }) => (
    <TooltipBox aria-hidden="true">
        <Key $color={color} />
        <Value>{value}</Value>
        <Label>{label}</Label>
    </TooltipBox>
)
