package br.univille.doabem.stockmovement.service;

import br.univille.doabem.common.error.ConflictException;
import br.univille.doabem.common.error.NotFoundException;
import br.univille.doabem.common.error.ValidationException;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.stock.service.StockService;
import br.univille.doabem.stockmovement.dto.MovementDetailResponse;
import br.univille.doabem.stockmovement.dto.MovementResponse;
import br.univille.doabem.stockmovement.dto.ReverseRequest;
import br.univille.doabem.stockmovement.entity.MovementType;
import br.univille.doabem.stockmovement.entity.StockMovement;
import br.univille.doabem.stockmovement.repository.StockMovementRepository;
import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.repository.AppUserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Stream;

// RF20 e RF21: histórico auditável e estorno. O lançamento original nunca é alterado (RN07).
@Service
public class MovementService {

    // D-08: reservas e liberações não aparecem na lista do usuário (ficam no detalhe da solicitação).
    public static final Set<MovementType> LISTED = EnumSet.of(
            MovementType.ENTRY, MovementType.DELIVERY, MovementType.ADJUSTMENT, MovementType.REVERSAL);

    // D-03: entradas, entregas e ajustes podem ser estornados; estorno de estorno, não.
    private static final Set<MovementType> REVERSIBLE = EnumSet.of(
            MovementType.ENTRY, MovementType.DELIVERY, MovementType.ADJUSTMENT);

    private final StockMovementRepository movementRepository;
    private final AppUserRepository userRepository;
    private final StockService stockService;

    public MovementService(StockMovementRepository movementRepository,
                           AppUserRepository userRepository,
                           StockService stockService) {
        this.movementRepository = movementRepository;
        this.userRepository = userRepository;
        this.stockService = stockService;
    }

    @Transactional(readOnly = true)
    public Page<MovementResponse> list(LocalDate from, LocalDate to, Long itemId, MovementType type,
                                       Long userId, Pageable pageable) {
        Specification<StockMovement> spec = (root, query, cb) -> root.get("type").in(LISTED);
        if (from != null) {
            LocalDateTime start = from.atStartOfDay();
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("occurredAt"), start));
        }
        if (to != null) {
            LocalDateTime end = to.plusDays(1).atStartOfDay();
            spec = spec.and((root, query, cb) -> cb.lessThan(root.get("occurredAt"), end));
        }
        if (itemId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("item").get("id"), itemId));
        }
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }
        if (userId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("user").get("id"), userId));
        }

        Page<StockMovement> page = movementRepository.findAll(spec, pageable);
        Map<Long, Long> reversedBy = reversedByIds(page.getContent());
        return page.map(movement -> MovementResponse.from(movement, reversedBy.get(movement.getId())));
    }

    @Transactional(readOnly = true)
    public MovementDetailResponse get(Long id) {
        StockMovement movement = find(id);
        Long reversalId = reversedByIds(List.of(movement)).get(movement.getId());

        StockMovement original = movement.getReverses() == null ? null : find(movement.getReverses().getId());
        StockMovement reversal = reversalId == null ? null : find(reversalId);

        Map<Long, Long> reversedBy = reversedByIds(
                Stream.of(movement, original, reversal).filter(Objects::nonNull).toList());
        return MovementDetailResponse.of(
                MovementResponse.from(movement, reversedBy.get(movement.getId())),
                original == null ? null : MovementResponse.from(original, reversedBy.get(original.getId())),
                reversal == null ? null : MovementResponse.from(reversal, reversedBy.get(reversal.getId())));
    }

    // RN22: só o Coordenador (garantido no controller), com justificativa, sem estorno duplo.
    @Transactional
    public MovementResponse reverse(Long id, ReverseRequest body, String userEmail) {
        StockMovement movement = find(id);
        // Trava o item antes de conferir qualquer coisa (RNF03): estornos, ajustes e separações do mesmo
        // item entram em fila, então o saldo conferido abaixo é o do momento em que o estorno é gravado.
        Item item = stockService.lockItem(movement.getItem().getId());

        if (!REVERSIBLE.contains(movement.getType())) {
            throw new ConflictException("Somente entradas, entregas e ajustes podem ser estornados.");
        }
        if (movementRepository.existsByReversesId(movement.getId())) {
            throw new ConflictException("Este lançamento já foi estornado.");
        }
        if (movement.getType() == MovementType.DELIVERY && !body.itemsReturned()) {
            throw new ValidationException("itemsReturned",
                    "O estorno de entrega devolve os itens ao estoque. Confirme que eles retornaram à instituição.");
        }
        if (movement.getType() == MovementType.ENTRY) {
            // RN22: estorno de entrada exige saldo disponível suficiente.
            stockService.ensureAvailable(item, movement.getQuantity());
        }

        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        StockMovement reversal = new StockMovement();
        reversal.setItem(item);
        reversal.setType(MovementType.REVERSAL);
        reversal.setQuantity(movement.getQuantity());
        reversal.setUser(user);
        reversal.setReverses(movement);
        reversal.setReason(body.justification().trim());
        return MovementResponse.from(movementRepository.save(reversal));
    }

    private StockMovement find(Long id) {
        return movementRepository.findWithReferenceById(id)
                .orElseThrow(() -> new NotFoundException("Lançamento não encontrado."));
    }

    // [lançamento original -> estorno], em uma consulta só.
    private Map<Long, Long> reversedByIds(Collection<StockMovement> movements) {
        if (movements.isEmpty()) {
            return Map.of();
        }
        Map<Long, Long> result = new HashMap<>();
        for (Object[] row : movementRepository.findReversalIds(movements.stream().map(StockMovement::getId).toList())) {
            result.put((Long) row[0], (Long) row[1]);
        }
        return result;
    }
}
