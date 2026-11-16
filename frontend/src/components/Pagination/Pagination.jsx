import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { PAGINATION_DOTS } from '@/constants/pagination.js'
import { getPaginationRange } from '@/utils/paginationRange.js'
import {
    Arrow,
    Dots,
    EdgeButton,
    Nav,
    PageButton,
    Side,
    StyledPagination,
    Summary,
} from './Pagination.styles.js'

export const Pagination = ({ page, totalPages, totalElements, isDisabled = false, onChange }) => {
    const lastPage = Math.max(totalPages, 1) - 1
    const isFirst = isDisabled || page === 0
    const isLast = isDisabled || page >= lastPage
    const pages = getPaginationRange(page + 1, Math.max(totalPages, 1))

    return (
        <StyledPagination aria-label="Paginação">
            <Side>
                <Summary>
                    Total: <strong>{totalElements}</strong>{' '}
                    {totalElements === 1 ? 'registro' : 'registros'}
                </Summary>
            </Side>
            {totalPages > 1 && (
                <Nav>
                    <EdgeButton type="button" onClick={() => onChange(0)} disabled={isFirst}>
                        Primeira
                    </EdgeButton>
                    <Arrow
                        type="button"
                        onClick={() => onChange(page - 1)}
                        disabled={isFirst}
                        aria-label="Página anterior"
                    >
                        <IconChevronLeft size={16} stroke={2} />
                    </Arrow>
                    {pages.map((item, index) =>
                        item === PAGINATION_DOTS ? (
                            <Dots key={`dots-${pages[index - 1]}`}>…</Dots>
                        ) : (
                            <PageButton
                                key={item}
                                type="button"
                                disabled={isDisabled}
                                $isActive={item === page + 1}
                                aria-current={item === page + 1 ? 'page' : undefined}
                                onClick={() => onChange(item - 1)}
                            >
                                {item}
                            </PageButton>
                        ),
                    )}
                    <Arrow
                        type="button"
                        onClick={() => onChange(page + 1)}
                        disabled={isLast}
                        aria-label="Próxima página"
                    >
                        <IconChevronRight size={16} stroke={2} />
                    </Arrow>
                    <EdgeButton type="button" onClick={() => onChange(lastPage)} disabled={isLast}>
                        Última
                    </EdgeButton>
                </Nav>
            )}
            <Side />
        </StyledPagination>
    )
}
