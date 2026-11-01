import { Button } from '@/components/Button/Button.jsx'
import { Toolbar } from '@/components/Toolbar/Toolbar.jsx'
import { ClearSlot, Fields, Slot } from './FilterBar.styles.js'

export const FilterBar = ({ isFiltered, onClear, children }) => (
    <Toolbar>
        <Fields>
            {children}
            <ClearSlot>
                <Button variant="outline" family="deny" disabled={!isFiltered} onClick={onClear}>
                    Limpar filtros
                </Button>
            </ClearSlot>
        </Fields>
    </Toolbar>
)

export const FilterSlot = ({ isGrowing = false, children }) => (
    <Slot $grow={isGrowing}>{children}</Slot>
)
