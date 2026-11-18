package br.univille.doabem.dashboard.service;

import br.univille.doabem.aidrequest.entity.AidRequest;
import br.univille.doabem.aidrequest.entity.AidRequestStatus;
import br.univille.doabem.aidrequest.repository.AidRequestItemRepository;
import br.univille.doabem.aidrequest.repository.AidRequestRepository;
import br.univille.doabem.category.entity.Category;
import br.univille.doabem.category.repository.CategoryRepository;
import br.univille.doabem.common.Status;
import br.univille.doabem.common.error.ValidationException;
import br.univille.doabem.delivery.repository.DeliveryRepository;
import br.univille.doabem.dashboard.dto.DashboardResponse;
import br.univille.doabem.donationentry.repository.DonationEntryRepository;
import br.univille.doabem.stock.dto.StockLevel;
import br.univille.doabem.stock.dto.StockRowResponse;
import br.univille.doabem.stock.service.StockService;
import br.univille.doabem.stockmovement.repository.StockMovementRepository;
import br.univille.doabem.stockmovement.service.MovementService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    // RF36: período padrão de 30 dias, terminando hoje.
    private static final int DEFAULT_PERIOD_DAYS = 30;
    private static final int TOP_CRITICAL_LIMIT = 5;
    private static final int MIN_CHART_MONTHS = 3;
    private static final int MAX_CHART_MONTHS = 12;

    private final CategoryRepository categoryRepository;
    private final DonationEntryRepository entryRepository;
    private final DeliveryRepository deliveryRepository;
    private final AidRequestRepository requestRepository;
    private final AidRequestItemRepository requestItemRepository;
    private final StockMovementRepository movementRepository;
    private final StockService stockService;

    public DashboardService(CategoryRepository categoryRepository,
                            DonationEntryRepository entryRepository,
                            DeliveryRepository deliveryRepository,
                            AidRequestRepository requestRepository,
                            AidRequestItemRepository requestItemRepository,
                            StockMovementRepository movementRepository,
                            StockService stockService) {
        this.categoryRepository = categoryRepository;
        this.entryRepository = entryRepository;
        this.deliveryRepository = deliveryRepository;
        this.requestRepository = requestRepository;
        this.requestItemRepository = requestItemRepository;
        this.movementRepository = movementRepository;
        this.stockService = stockService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse get(LocalDate from, LocalDate to) {
        LocalDate end = to != null ? to : LocalDate.now();
        LocalDate start = from != null ? from : end.minusDays(DEFAULT_PERIOD_DAYS - 1L);
        if (start.isAfter(end)) {
            throw new ValidationException("from", "A data inicial não pode ser posterior à final.");
        }

        // RN29: indicadores de estoque refletem o momento atual, só de itens ativos.
        List<StockRowResponse> activeRows = stockService.list(Status.ACTIVE);
        List<StockRowResponse> critical = activeRows.stream()
                .filter(row -> row.level() == StockLevel.CRITICAL)
                .toList();
        List<Category> activeCategories = categoryRepository.findAll().stream().filter(Category::isActive).toList();

        long days = ChronoUnit.DAYS.between(start, end) + 1;
        LocalDate previousEnd = start.minusDays(1);
        LocalDate previousStart = start.minusDays(days);

        return new DashboardResponse(
                activeRows.size(),
                activeCategories.size(),
                critical.size(),
                countEntries(start, end),
                countDeliveries(start, end),
                requestRepository.countByStatus(AidRequestStatus.PENDING),
                critical.stream()
                        .sorted(Comparator.comparing(this::criticalRatio))
                        .limit(TOP_CRITICAL_LIMIT)
                        .toList(),
                recentMovements(),
                monthly(start, end),
                balanceByCategory(activeCategories, activeRows),
                pendingList(),
                new DashboardResponse.PeriodTotals(
                        countEntries(previousStart, previousEnd), countDeliveries(previousStart, previousEnd)),
                LocalDateTime.now());
    }

    // Quanto menor, mais crítico: disponível proporcional ao mínimo (mínimo 0 conta como 1).
    private BigDecimal criticalRatio(StockRowResponse row) {
        return row.available().divide(row.minStock().max(BigDecimal.ONE), 6, RoundingMode.HALF_UP);
    }

    private long countEntries(LocalDate from, LocalDate to) {
        return entryRepository.countByEntryDateBetween(from, to);
    }

    private long countDeliveries(LocalDate from, LocalDate to) {
        return deliveryRepository.countByDeliveredAtGreaterThanEqualAndDeliveredAtLessThan(
                from.atStartOfDay(), to.plusDays(1).atStartOfDay());
    }

    private List<DashboardResponse.RecentMovement> recentMovements() {
        return movementRepository.findTop6ByTypeInOrderByOccurredAtDescIdDesc(MovementService.LISTED).stream()
                .map(movement -> new DashboardResponse.RecentMovement(
                        movement.getId(),
                        movement.getType(),
                        movement.getOccurredAt(),
                        movement.getItem().getName(),
                        movement.getItem().getUnitOfMeasure(),
                        movement.getQuantity(),
                        movement.getUser().getName()))
                .toList();
    }

    // Série mensal que termina no mês do fim do período, com 3 a 12 meses; considera todo o histórico do mês.
    private List<DashboardResponse.MonthlyPoint> monthly(LocalDate start, LocalDate end) {
        YearMonth last = YearMonth.from(end);
        long spanned = ChronoUnit.MONTHS.between(YearMonth.from(start), last) + 1;
        int count = (int) Math.min(MAX_CHART_MONTHS, Math.max(MIN_CHART_MONTHS, spanned));
        YearMonth first = last.minusMonths(count - 1L);

        Map<YearMonth, Long> entries = entryRepository
                .findEntryDatesBetween(first.atDay(1), last.atEndOfMonth()).stream()
                .collect(Collectors.groupingBy(YearMonth::from, Collectors.counting()));
        Map<YearMonth, Long> deliveries = deliveryRepository
                .findDeliveredAtBetween(first.atDay(1).atStartOfDay(), last.plusMonths(1).atDay(1).atStartOfDay()).stream()
                .collect(Collectors.groupingBy(YearMonth::from, Collectors.counting()));

        return java.util.stream.IntStream.range(0, count)
                .mapToObj(first::plusMonths)
                .map(month -> new DashboardResponse.MonthlyPoint(
                        month.toString(), entries.getOrDefault(month, 0L), deliveries.getOrDefault(month, 0L)))
                .toList();
    }

    private List<DashboardResponse.CategoryBalance> balanceByCategory(List<Category> categories,
                                                                      List<StockRowResponse> activeRows) {
        Map<Long, BigDecimal> totals = new HashMap<>();
        activeRows.forEach(row -> totals.merge(row.categoryId(), row.available(), BigDecimal::add));
        return categories.stream()
                .map(category -> new DashboardResponse.CategoryBalance(
                        category.getId(), category.getName(), totals.getOrDefault(category.getId(), BigDecimal.ZERO)))
                .sorted(Comparator.comparing(DashboardResponse.CategoryBalance::available).reversed())
                .toList();
    }

    // Mais antigas primeiro: são as que esperam há mais tempo.
    private List<DashboardResponse.PendingRequest> pendingList() {
        List<AidRequest> pending = requestRepository.findTop5ByStatusOrderByCreatedAtAscIdAsc(AidRequestStatus.PENDING);
        Map<Long, Long> counts = new HashMap<>();
        if (!pending.isEmpty()) {
            for (Object[] row : requestItemRepository.countByRequestIds(pending.stream().map(AidRequest::getId).toList())) {
                counts.put((Long) row[0], (Long) row[1]);
            }
        }
        return pending.stream()
                .map(request -> new DashboardResponse.PendingRequest(
                        request.getId(),
                        request.getCreatedAt(),
                        request.getBeneficiary().getResponsibleName(),
                        counts.getOrDefault(request.getId(), 0L)))
                .toList();
    }
}
