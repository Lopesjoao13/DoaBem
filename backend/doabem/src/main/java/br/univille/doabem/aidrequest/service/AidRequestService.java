package br.univille.doabem.aidrequest.service;

import br.univille.doabem.aidrequest.dto.CancelRequest;
import br.univille.doabem.aidrequest.dto.CreateAidRequestRequest;
import br.univille.doabem.aidrequest.dto.DecisionRequest;
import br.univille.doabem.aidrequest.dto.DeliverRequest;
import br.univille.doabem.aidrequest.dto.RequestActionResponse;
import br.univille.doabem.aidrequest.dto.RequestDetailResponse;
import br.univille.doabem.aidrequest.dto.RequestListResponse;
import br.univille.doabem.aidrequest.dto.RequestRowResponse;
import br.univille.doabem.aidrequest.entity.AidRequest;
import br.univille.doabem.aidrequest.entity.AidRequestItem;
import br.univille.doabem.aidrequest.entity.AidRequestStatus;
import br.univille.doabem.aidrequest.repository.AidRequestItemRepository;
import br.univille.doabem.aidrequest.repository.AidRequestRepository;
import br.univille.doabem.beneficiary.entity.Beneficiary;
import br.univille.doabem.beneficiary.repository.BeneficiaryRepository;
import br.univille.doabem.beneficiary.service.BeneficiaryHistoryService;
import br.univille.doabem.common.Status;
import br.univille.doabem.common.error.BusinessRuleException;
import br.univille.doabem.common.error.ConflictException;
import br.univille.doabem.common.error.NotFoundException;
import br.univille.doabem.common.error.ValidationException;
import br.univille.doabem.delivery.entity.Delivery;
import br.univille.doabem.delivery.entity.DeliveryItem;
import br.univille.doabem.delivery.repository.DeliveryRepository;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.repository.ItemRepository;
import br.univille.doabem.stock.service.StockBalance;
import br.univille.doabem.stock.service.StockService;
import br.univille.doabem.stockmovement.entity.MovementType;
import br.univille.doabem.stockmovement.entity.StockMovement;
import br.univille.doabem.stockmovement.repository.StockMovementRepository;
import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.repository.AppUserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PagedModel.PageMetadata;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

// RF26 a RF33: solicitação, análise, separação (reserva), entrega (baixa) e cancelamento.
// Cada transição é uma transação única: a linha da solicitação é travada e, ao reservar, as dos itens também.
@Service
public class AidRequestService {

    public static final String ALL_COUNT = "ALL";
    private static final String COORDINATOR_ROLE = "COORDINATOR";

    private final AidRequestRepository requestRepository;
    private final AidRequestItemRepository requestItemRepository;
    private final DeliveryRepository deliveryRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final ItemRepository itemRepository;
    private final AppUserRepository userRepository;
    private final StockMovementRepository movementRepository;
    private final StockService stockService;
    private final BeneficiaryHistoryService historyService;

    public AidRequestService(AidRequestRepository requestRepository,
                             AidRequestItemRepository requestItemRepository,
                             DeliveryRepository deliveryRepository,
                             BeneficiaryRepository beneficiaryRepository,
                             ItemRepository itemRepository,
                             AppUserRepository userRepository,
                             StockMovementRepository movementRepository,
                             StockService stockService,
                             BeneficiaryHistoryService historyService) {
        this.requestRepository = requestRepository;
        this.requestItemRepository = requestItemRepository;
        this.deliveryRepository = deliveryRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.movementRepository = movementRepository;
        this.stockService = stockService;
        this.historyService = historyService;
    }

    // ---------------------------------------------------------------- consultas

    // As contagens por estado respeitam os demais filtros, mas não o próprio filtro de estado (abas da tela).
    @Transactional(readOnly = true)
    public RequestListResponse list(AidRequestStatus status, LocalDate from, LocalDate to,
                                    Long requestedById, String search, Pageable pageable) {
        Specification<AidRequest> base = filters(from, to, requestedById, search);
        Specification<AidRequest> spec = status == null ? base : base.and(hasStatus(status));

        Page<AidRequest> page = requestRepository.findAll(spec, pageable);
        Map<Long, Long> itemCounts = itemCounts(page.getContent().stream().map(AidRequest::getId).toList());
        List<RequestRowResponse> content = page.getContent().stream()
                .map(request -> RequestRowResponse.of(request, itemCounts.getOrDefault(request.getId(), 0L)))
                .toList();

        Map<String, Long> counts = new LinkedHashMap<>();
        long total = 0;
        for (AidRequestStatus each : AidRequestStatus.values()) {
            long count = requestRepository.count(base.and(hasStatus(each)));
            counts.put(each.name(), count);
            total += count;
        }
        counts.put(ALL_COUNT, total);

        PageMetadata metadata = new PageMetadata(
                page.getSize(), page.getNumber(), page.getTotalElements(), page.getTotalPages());
        return new RequestListResponse(content, metadata, counts);
    }

    @Transactional(readOnly = true)
    public RequestDetailResponse get(Long id) {
        AidRequest request = requestRepository.findWithDetailsById(id)
                .orElseThrow(() -> new NotFoundException("Solicitação não encontrada."));

        List<AidRequestItem> lines = request.getItems();
        Set<Long> itemIds = lines.stream().map(line -> line.getItem().getId()).collect(Collectors.toSet());
        Map<Long, StockBalance> balances = stockService.balancesOf(itemIds);

        List<RequestDetailResponse.Line> items = lines.stream()
                .map(line -> new RequestDetailResponse.Line(
                        line.getId(),
                        line.getItem().getId(),
                        line.getItem().getName(),
                        line.getItem().getUnitOfMeasure(),
                        line.getItem().getStatus(),
                        line.getRequestedQty(),
                        line.getApprovedQty(),
                        balances.getOrDefault(line.getItem().getId(), StockBalance.ZERO).available()))
                .toList();

        Beneficiary family = request.getBeneficiary();
        RequestDetailResponse.Family familyResponse = new RequestDetailResponse.Family(
                family.getId(), family.getResponsibleName(), family.getHouseholdSize(),
                family.getNeighborhood(), family.getPhone(), family.getStatus());

        RequestDetailResponse.DeliveryInfo delivery = deliveryRepository.findWithDetailsByAidRequestId(id)
                .map(d -> new RequestDetailResponse.DeliveryInfo(
                        d.getId(), d.getDeliveredAt(), d.getDeliveredBy().getName(), d.getNotes()))
                .orElse(null);

        return new RequestDetailResponse(
                request.getId(),
                request.getStatus(),
                request.getCreatedAt(),
                family.getId(),
                family.getResponsibleName(),
                request.getRequestedBy().getName(),
                lines.size(),
                familyResponse,
                items,
                nameOf(request.getDecidedBy()),
                request.getDecidedAt(),
                request.getJustification(),
                nameOf(request.getPickedBy()),
                request.getPickedAt(),
                nameOf(request.getCancelledBy()),
                request.getCancelledAt(),
                request.getCancellationReason(),
                delivery,
                // RF25: última entrega e entregas recentes da família, só como apoio à decisão (RN26).
                historyService.deliverySummary(family.getId()));
    }

    // ---------------------------------------------------------------- criação (RF26)

    // Cria PENDENTE: não reserva nem baixa estoque (RN17).
    @Transactional
    public RequestActionResponse create(CreateAidRequestRequest body, String userEmail) {
        AppUser user = findUser(userEmail);
        Beneficiary beneficiary = beneficiaryRepository.findById(body.beneficiaryId())
                .orElseThrow(() -> new NotFoundException("Família não encontrada."));

        Map<String, String> errors = new LinkedHashMap<>();
        if (beneficiary.getStatus() != Status.ACTIVE) {
            errors.put("beneficiaryId", "Somente famílias ativas recebem novas solicitações.");
        }

        List<CreateAidRequestRequest.Line> lines = body.lines();
        Map<Long, Item> itemsById = itemRepository
                .findAllById(lines.stream().map(CreateAidRequestRequest.Line::itemId).distinct().toList())
                .stream().collect(Collectors.toMap(Item::getId, Function.identity()));

        Set<Long> seen = new HashSet<>();
        AidRequest request = new AidRequest();
        request.setBeneficiary(beneficiary);
        request.setRequestedBy(user);
        for (int index = 0; index < lines.size(); index++) {
            CreateAidRequestRequest.Line line = lines.get(index);
            Item item = itemsById.get(line.itemId());
            if (item == null) {
                throw new NotFoundException("Item não encontrado (id " + line.itemId() + ").");
            }
            if (item.getStatus() != Status.ACTIVE) {
                errors.put("lines[" + index + "].itemId", "Escolha um item ativo.");
            } else if (!seen.add(item.getId())) {
                errors.put("lines[" + index + "].itemId", "Este item já foi adicionado.");
            }
            if (!item.getUnitOfMeasure().accepts(line.requestedQty())) {
                errors.put("lines[" + index + "].requestedQty", "Itens em " + item.getUnitOfMeasure()
                        + " aceitam " + item.getUnitOfMeasure().getQuantityRule() + ".");
            }

            AidRequestItem requestItem = new AidRequestItem();
            requestItem.setItem(item);
            requestItem.setRequestedQty(line.requestedQty());
            request.addItem(requestItem);
        }
        failIfAny(errors);

        return RequestActionResponse.of(requestRepository.save(request));
    }

    // ---------------------------------------------------------------- análise (RF28)

    // Só o Coordenador (garantido no controller). Não mexe no estoque (RN17).
    @Transactional
    public RequestActionResponse decide(Long id, DecisionRequest body, String userEmail) {
        AidRequest request = lock(id);
        ensureStatus(request, AidRequestStatus.PENDING, "Somente solicitações pendentes podem ser analisadas.");
        AppUser user = findUser(userEmail);
        String justification = blankToNull(body.justification());

        if (body.decision() == DecisionRequest.Decision.REJECT) {
            if (justification == null) {
                throw new ValidationException("justification", "Informe a justificativa.");
            }
            request.getItems().forEach(line -> line.setApprovedQty(BigDecimal.ZERO));
            return decided(request, user, AidRequestStatus.REJECTED, justification);
        }

        Map<Long, BigDecimal> approved = resolveApproved(request, body.items(), justification);
        boolean allZero = true;
        for (AidRequestItem line : request.getItems()) {
            BigDecimal quantity = approved.get(line.getId());
            line.setApprovedQty(quantity);
            allZero &= quantity.signum() == 0;
        }
        // D-06: aprovação com tudo zerado equivale a recusa (a justificativa já foi exigida pelo corte).
        return decided(request, user, allZero ? AidRequestStatus.REJECTED : AidRequestStatus.APPROVED, justification);
    }

    // ---------------------------------------------------------------- separação (RF30)

    // RN04/RN17: confere o disponível e reserva de forma atômica, com os itens travados.
    @Transactional
    public RequestActionResponse pick(Long id, String userEmail) {
        AidRequest request = lock(id);
        ensureStatus(request, AidRequestStatus.APPROVED, "Somente solicitações aprovadas podem ser separadas.");
        AppUser user = findUser(userEmail);

        List<AidRequestItem> approved = approvedLines(request);
        // Trava os itens em ordem de id (evita deadlock entre separações) antes de calcular o saldo.
        List<Long> itemIds = approved.stream().map(line -> line.getItem().getId()).sorted().toList();
        itemIds.forEach(stockService::lockItem);

        for (AidRequestItem line : approved) {
            if (line.getItem().getStatus() != Status.ACTIVE) {
                throw new BusinessRuleException("O item \"" + line.getItem().getName()
                        + "\" está inativo. Revise a solicitação.");
            }
        }

        Map<Long, StockBalance> balances = stockService.balancesOf(itemIds);
        List<String> shortages = new ArrayList<>();
        for (AidRequestItem line : approved) {
            Item item = line.getItem();
            BigDecimal available = balances.getOrDefault(item.getId(), StockBalance.ZERO).available();
            if (line.getApprovedQty().compareTo(available) > 0) {
                shortages.add(item.getName() + ": aprovado " + stockService.format(line.getApprovedQty(), item.getUnitOfMeasure())
                        + ", disponível " + stockService.format(available.max(BigDecimal.ZERO), item.getUnitOfMeasure()));
            }
        }
        if (!shortages.isEmpty()) {
            throw new BusinessRuleException("Saldo insuficiente para separar. " + String.join("; ", shortages)
                    + ". Nenhuma reserva foi feita: revise a solicitação ou cancele e crie outra.");
        }

        LocalDateTime now = LocalDateTime.now();
        for (AidRequestItem line : approved) {
            movementRepository.save(movement(line, MovementType.RESERVE, line.getApprovedQty(), user, now, null));
        }
        request.setStatus(AidRequestStatus.PICKED);
        request.setPickedAt(now);
        request.setPickedBy(user);
        return RequestActionResponse.of(request);
    }

    // ---------------------------------------------------------------- entrega (RF31, RN20)

    // Sempre total: consome a reserva (RELEASE) e baixa o físico (DELIVERY) de tudo o que foi separado.
    @Transactional
    public RequestActionResponse deliver(Long id, DeliverRequest body, String userEmail) {
        AidRequest request = lock(id);
        ensureStatus(request, AidRequestStatus.PICKED, "Somente solicitações separadas podem ser entregues.");
        AppUser user = findUser(userEmail);
        LocalDateTime now = LocalDateTime.now();

        Delivery delivery = new Delivery();
        delivery.setAidRequest(request);
        delivery.setDeliveredBy(user);
        delivery.setDeliveredAt(now);
        delivery.setNotes(body == null ? null : blankToNull(body.notes()));
        for (AidRequestItem line : approvedLines(request)) {
            DeliveryItem deliveryItem = new DeliveryItem();
            deliveryItem.setAidRequestItem(line);
            deliveryItem.setDeliveredQty(line.getApprovedQty());
            delivery.addItem(deliveryItem);
        }
        Delivery saved = deliveryRepository.save(delivery);

        for (DeliveryItem deliveryItem : saved.getItems()) {
            AidRequestItem line = deliveryItem.getAidRequestItem();
            movementRepository.save(movement(line, MovementType.DELIVERY, deliveryItem.getDeliveredQty(), user, now, deliveryItem));
            movementRepository.save(movement(line, MovementType.RELEASE, deliveryItem.getDeliveredQty(), user, now, deliveryItem));
        }
        request.setStatus(AidRequestStatus.DELIVERED);
        return RequestActionResponse.of(request);
    }

    // ---------------------------------------------------------------- cancelamento (RF33, RN06, RN19)

    // D-04: PENDENTE/APROVADA só o Coordenador; SEPARADA, Operador ou Coordenador. Libera as reservas.
    @Transactional
    public RequestActionResponse cancel(Long id, CancelRequest body, String userEmail, String role) {
        AidRequest request = lock(id);
        if (!request.getStatus().isOpen()) {
            throw new ConflictException("Esta solicitação não pode mais ser cancelada.");
        }
        if (request.getStatus() != AidRequestStatus.PICKED && !COORDINATOR_ROLE.equals(role)) {
            throw new AccessDeniedException("Acesso negado.");
        }
        AppUser user = findUser(userEmail);
        LocalDateTime now = LocalDateTime.now();

        if (request.getStatus() == AidRequestStatus.PICKED) {
            for (AidRequestItem line : approvedLines(request)) {
                movementRepository.save(movement(line, MovementType.RELEASE, line.getApprovedQty(), user, now, null));
            }
        }
        request.setStatus(AidRequestStatus.CANCELLED);
        request.setCancelledAt(now);
        request.setCancelledBy(user);
        request.setCancellationReason(body.reason().trim());
        return RequestActionResponse.of(request);
    }

    // ---------------------------------------------------------------- internos

    private AidRequest lock(Long id) {
        return requestRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("Solicitação não encontrada."));
    }

    private void ensureStatus(AidRequest request, AidRequestStatus expected, String message) {
        if (request.getStatus() != expected) {
            throw new ConflictException(message);
        }
    }

    private AppUser findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    }

    private RequestActionResponse decided(AidRequest request, AppUser user, AidRequestStatus status, String justification) {
        request.setStatus(status);
        request.setDecidedBy(user);
        request.setDecidedAt(LocalDateTime.now());
        request.setJustification(justification);
        return RequestActionResponse.of(request);
    }

    // RN16: aprovado <= solicitado, na unidade do item; corte exige justificativa.
    private Map<Long, BigDecimal> resolveApproved(AidRequest request, List<DecisionRequest.ApprovedLine> sent, String justification) {
        Map<String, String> errors = new LinkedHashMap<>();
        Map<Long, BigDecimal> sentById = new HashMap<>();
        if (sent != null) {
            Set<Long> lineIds = request.getItems().stream().map(AidRequestItem::getId).collect(Collectors.toSet());
            for (DecisionRequest.ApprovedLine line : sent) {
                if (!lineIds.contains(line.id())) {
                    errors.put("items", "A linha " + line.id() + " não pertence a esta solicitação.");
                } else if (sentById.put(line.id(), line.approvedQty()) != null) {
                    errors.put("items", "A linha " + line.id() + " foi informada mais de uma vez.");
                }
            }
        }

        Map<Long, BigDecimal> approved = new HashMap<>();
        boolean hasCut = false;
        for (AidRequestItem line : request.getItems()) {
            BigDecimal quantity = sentById.get(line.getId());
            String key = "approved." + line.getId();
            if (quantity == null) {
                errors.put(key, "Informe a quantidade aprovada.");
                continue;
            }
            if (!line.getItem().getUnitOfMeasure().accepts(quantity)) {
                errors.put(key, "Itens em " + line.getItem().getUnitOfMeasure()
                        + " aceitam " + line.getItem().getUnitOfMeasure().getQuantityRule() + ".");
            } else if (quantity.compareTo(line.getRequestedQty()) > 0) {
                errors.put(key, "O aprovado não pode exceder o solicitado.");
            }
            hasCut |= quantity.compareTo(line.getRequestedQty()) < 0;
            approved.put(line.getId(), quantity);
        }
        if (hasCut && justification == null) {
            errors.put("justification", "Informe a justificativa da aprovação parcial.");
        }
        failIfAny(errors);
        return approved;
    }

    // RN16: item aprovado com 0 sai da distribuição.
    private boolean isApproved(AidRequestItem line) {
        return line.getApprovedQty() != null && line.getApprovedQty().signum() > 0;
    }

    private List<AidRequestItem> approvedLines(AidRequest request) {
        return request.getItems().stream().filter(this::isApproved).sorted(Comparator.comparing(AidRequestItem::getId)).toList();
    }

    private StockMovement movement(AidRequestItem line, MovementType type, BigDecimal quantity,
                                   AppUser user, LocalDateTime at, DeliveryItem deliveryItem) {
        StockMovement movement = new StockMovement();
        movement.setItem(line.getItem());
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setUser(user);
        movement.setOccurredAt(at);
        movement.setAidRequestItem(line);
        movement.setDeliveryItem(deliveryItem);
        return movement;
    }

    private Map<Long, Long> itemCounts(Collection<Long> requestIds) {
        if (requestIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : requestItemRepository.countByRequestIds(requestIds)) {
            counts.put((Long) row[0], (Long) row[1]);
        }
        return counts;
    }

    private Specification<AidRequest> filters(LocalDate from, LocalDate to, Long requestedById, String search) {
        Specification<AidRequest> spec = Specification.unrestricted();
        if (from != null) {
            LocalDateTime start = from.atStartOfDay();
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), start));
        }
        if (to != null) {
            LocalDateTime end = to.plusDays(1).atStartOfDay();
            spec = spec.and((root, query, cb) -> cb.lessThan(root.get("createdAt"), end));
        }
        if (requestedById != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("requestedBy").get("id"), requestedById));
        }
        if (search != null && !search.isBlank()) {
            String term = search.trim();
            String pattern = "%" + term.toLowerCase(Locale.ROOT) + "%";
            Long id = parseId(term);
            spec = spec.and((root, query, cb) -> {
                Predicate byName = cb.like(cb.lower(root.get("beneficiary").get("responsibleName")), pattern);
                return id == null ? byName : cb.or(byName, cb.equal(root.get("id"), id));
            });
        }
        return spec;
    }

    private Specification<AidRequest> hasStatus(AidRequestStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    // Aceita "12" e "#12" (como o id aparece na tela).
    private Long parseId(String term) {
        String digits = term.startsWith("#") ? term.substring(1) : term;
        try {
            return Long.parseLong(digits);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private void failIfAny(Map<String, String> errors) {
        if (!errors.isEmpty()) {
            throw new ValidationException("Revise os campos destacados.", errors);
        }
    }

    private String nameOf(AppUser user) {
        return user == null ? null : user.getName();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
