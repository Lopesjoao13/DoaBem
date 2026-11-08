import { Select } from '@/components/Select/Select.jsx'
import { STATUS_FILTER_OPTIONS } from '@/constants/stockFilters.js'

export const StatusFilter = ({ value, onChange, ...props }) => (
    <Select
        value={value}
        options={STATUS_FILTER_OPTIONS}
        onChange={(event) => onChange(event.target.value)}
        {...props}
    />
)
