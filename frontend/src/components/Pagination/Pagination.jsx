import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Button } from '@/components/Button/Button.jsx'
import { Controls, StyledPagination, Summary } from './Pagination.styles.js'

export const Pagination = ({ page, totalPages, totalElements, onChange }) => (
    <StyledPagination aria-label="Paginação">
        <Summary>
            {totalElements} {totalElements === 1 ? 'registro' : 'registros'} · página {page + 1} de{' '}
            {Math.max(totalPages, 1)}
        </Summary>
        <Controls>
            <Button variant="outline" onClick={() => onChange(page - 1)} disabled={page === 0}>
                <IconChevronLeft size={16} stroke={2} />
                Anterior
            </Button>
            <Button
                variant="outline"
                onClick={() => onChange(page + 1)}
                disabled={page + 1 >= totalPages}
            >
                Próxima
                <IconChevronRight size={16} stroke={2} />
            </Button>
        </Controls>
    </StyledPagination>
)
