import { PAGINATION_DOTS, PAGINATION_SIBLINGS } from '@/constants/pagination.js'

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index)

export const getPaginationRange = (currentPage, totalPages) => {
    const visibleCount = PAGINATION_SIBLINGS * 2 + 5
    if (totalPages <= visibleCount) return range(1, totalPages)

    const left = Math.max(currentPage - PAGINATION_SIBLINGS, 1)
    const right = Math.min(currentPage + PAGINATION_SIBLINGS, totalPages)
    const hasLeftDots = left > 2
    const hasRightDots = right < totalPages - 1
    const edgeCount = PAGINATION_SIBLINGS * 2 + 3

    if (!hasLeftDots) return [...range(1, edgeCount), PAGINATION_DOTS, totalPages]
    if (!hasRightDots) return [1, PAGINATION_DOTS, ...range(totalPages - edgeCount + 1, totalPages)]
    return [1, PAGINATION_DOTS, ...range(left, right), PAGINATION_DOTS, totalPages]
}
