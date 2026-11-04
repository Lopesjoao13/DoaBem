import { ChartLegend } from '@/components/ChartLegend/ChartLegend.jsx'
import { ChartTooltip } from '@/components/ChartTooltip/ChartTooltip.jsx'
import { Panel } from '@/components/Panel/Panel.jsx'
import { StateMessage } from '@/components/StateMessage/StateMessage.jsx'
import { LEVEL_SERIES } from '@/constants/dashboard.js'
import { toPercent } from '@/utils/chartScale.js'
import {
    CategoryName,
    Row,
    Rows,
    Segment,
    Stack,
    Total,
    Track,
} from './CategoryLevelsChart.styles.js'

const getTotal = (category) => LEVEL_SERIES.reduce((sum, { key }) => sum + category[key], 0)

const pluralizeItems = (count) => `${count} ${count === 1 ? 'item' : 'itens'}`

const CategoryRow = ({ category, maxTotal }) => {
    const total = getTotal(category)

    return (
        <Row>
            <CategoryName>{category.categoryName}</CategoryName>
            <Track>
                <Stack $width={toPercent(total, maxTotal)}>
                    {LEVEL_SERIES.filter(({ key }) => category[key] > 0).map(
                        ({ key, label, color }) => (
                            <Segment
                                key={key}
                                tabIndex={0}
                                $grow={category[key]}
                                $color={color}
                                aria-label={`${category.categoryName}, ${label}: ${pluralizeItems(category[key])}`}
                            >
                                <ChartTooltip value={category[key]} label={label} color={color} />
                            </Segment>
                        ),
                    )}
                </Stack>
            </Track>
            <Total>{total}</Total>
        </Row>
    )
}

export const CategoryLevelsChart = ({ categories }) => {
    const maxTotal = Math.max(0, ...categories.map(getTotal))

    return (
        <Panel title="Itens por categoria" subtitle="Saldo atual · itens ativos por nível">
            {maxTotal === 0 ? (
                <StateMessage
                    title="Nenhum item ativo"
                    description="Cadastre itens para acompanhar o nível de cada categoria."
                />
            ) : (
                <>
                    <ChartLegend series={LEVEL_SERIES} />
                    <Rows>
                        {categories.map((category) => (
                            <CategoryRow
                                key={category.categoryId}
                                category={category}
                                maxTotal={maxTotal}
                            />
                        ))}
                    </Rows>
                </>
            )}
        </Panel>
    )
}
