import { formatQuantity } from '@/utils/formatters.js'
import { Fill, MinLabel, Track, Wrapper } from './StockLevelBar.styles.js'
import { FULL_SCALE_FACTOR, MAX_PERCENT } from '@/constants/stockLevels.js'

const getFillPercent = (available, minStock) => {
    if (available <= 0) return 0
    if (minStock <= 0) return MAX_PERCENT
    return Math.min((available / (minStock * FULL_SCALE_FACTOR)) * MAX_PERCENT, MAX_PERCENT)
}

export const StockLevelBar = ({ available, minStock, unitOfMeasure, level }) => (
    <Wrapper>
        <Track aria-hidden="true">
            <Fill $level={level} $percent={getFillPercent(available, minStock)} />
        </Track>
        <MinLabel>mín. {formatQuantity(minStock, unitOfMeasure)}</MinLabel>
    </Wrapper>
)
