package br.univille.doabem.dashboard.dto;

import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.stock.dto.StockRowResponse;
import br.univille.doabem.stockmovement.entity.MovementType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// RF35 e RF36: estoque e pendências refletem o momento atual; entradas e entregas respeitam o período.
public record DashboardResponse(
        long activeItems,
        long activeCategories,
        long criticalItems,
        long entriesInPeriod,
        long deliveriesInPeriod,
        long pendingRequests,
        List<StockRowResponse> topCritical,
        List<RecentMovement> recentMovements,
        List<MonthlyPoint> monthly,
        List<CategoryBalance> balanceByCategory,
        List<PendingRequest> pendingList,
        PeriodTotals previous,
        LocalDateTime generatedAt
) {

    public record RecentMovement(
            Long id,
            MovementType type,
            LocalDateTime occurredAt,
            String itemName,
            UnitOfMeasure unitOfMeasure,
            BigDecimal quantity,
            String userName
    ) {
    }

    // month no formato yyyy-MM.
    public record MonthlyPoint(String month, long entries, long deliveries) {
    }

    public record CategoryBalance(Long categoryId, String categoryName, BigDecimal available) {
    }

    public record PendingRequest(Long id, LocalDateTime createdAt, String beneficiaryName, long itemCount) {
    }

    // Mesmo número de dias, imediatamente antes do período, para comparação.
    public record PeriodTotals(long entries, long deliveries) {
    }
}
