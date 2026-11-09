package br.univille.doabem.stock.service;

import br.univille.doabem.common.Status;
import br.univille.doabem.common.error.BusinessRuleException;
import br.univille.doabem.common.error.NotFoundException;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.item.repository.ItemRepository;
import br.univille.doabem.stock.dto.CreateAdjustmentRequest;
import br.univille.doabem.stock.dto.StockRowResponse;
import br.univille.doabem.stockmovement.dto.MovementResponse;
import br.univille.doabem.stockmovement.entity.MovementType;
import br.univille.doabem.stockmovement.entity.StockMovement;
import br.univille.doabem.stockmovement.repository.MovementTotal;
import br.univille.doabem.stockmovement.repository.StockMovementRepository;
import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class StockService {

    private final ItemRepository itemRepository;
    private final StockMovementRepository movementRepository;
    private final AppUserRepository userRepository;

    public StockService(ItemRepository itemRepository,
                        StockMovementRepository movementRepository,
                        AppUserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.movementRepository = movementRepository;
        this.userRepository = userRepository;
    }

    // RF17: saldo físico, reservado e disponível por item. Somente leitura (RN03).
    @Transactional(readOnly = true)
    public List<StockRowResponse> list(Status status) {
        List<Item> items = status == null
                ? itemRepository.findAllByOrderByNameAsc()
                : itemRepository.findByStatusOrderByNameAsc(status);
        Map<Long, StockBalance> balances = toBalances(movementRepository.totalsByItem());

        return items.stream()
                .map(item -> StockRowResponse.from(item, balances.getOrDefault(item.getId(), StockBalance.ZERO)))
                .toList();
    }

    @Transactional(readOnly = true)
    public StockBalance balanceOf(Long itemId) {
        return toBalances(movementRepository.totalsForItem(itemId)).getOrDefault(itemId, StockBalance.ZERO);
    }

    // Trava a linha do item até o fim da transação. Todo código que confere o disponível
    // e grava RESERVE, DELIVERY ou ADJUSTMENT deve chamar isto antes (RNF03).
    @Transactional(propagation = Propagation.MANDATORY)
    public Item lockItem(Long itemId) {
        return itemRepository.findByIdForUpdate(itemId)
                .orElseThrow(() -> new NotFoundException("Item não encontrado (id " + itemId + ")."));
    }

    // RN01 e RN04: nunca deixa a quantidade passar do disponível.
    public void ensureAvailable(Item item, BigDecimal quantity) {
        BigDecimal available = balanceOf(item.getId()).available();
        if (quantity.compareTo(available) > 0) {
            throw new BusinessRuleException("Saldo disponível insuficiente: há "
                    + format(available, item.getUnitOfMeasure()) + " de \"" + item.getName()
                    + "\". O estoque não pode ficar negativo.");
        }
    }

    // RF19 e RN13: saída por ajuste, só Coordenador (a permissão fica no controller).
    @Transactional
    public MovementResponse adjust(CreateAdjustmentRequest request, String userEmail) {
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
        Item item = lockItem(request.itemId());

        if (item.getStatus() != Status.ACTIVE) {
            throw new BusinessRuleException("O item \"" + item.getName() + "\" está inativo e não pode receber ajustes.");
        }
        if (!item.getUnitOfMeasure().accepts(request.quantity())) {
            throw new BusinessRuleException("Quantidade inválida para o item \"" + item.getName() + "\": itens em "
                    + item.getUnitOfMeasure() + " aceitam " + item.getUnitOfMeasure().getQuantityRule() + ".");
        }
        ensureAvailable(item, request.quantity());

        StockMovement movement = new StockMovement();
        movement.setItem(item);
        movement.setType(MovementType.ADJUSTMENT);
        movement.setQuantity(request.quantity());
        movement.setUser(user);
        movement.setAdjustmentReason(request.adjustmentReason());
        movement.setReason(request.notes().trim());

        return MovementResponse.from(movementRepository.save(movement));
    }

    private Map<Long, StockBalance> toBalances(List<MovementTotal> totals) {
        Map<Long, StockBalance> balances = new HashMap<>();
        for (MovementTotal total : totals) {
            StockBalance current = balances.getOrDefault(total.getItemId(), StockBalance.ZERO);
            balances.put(total.getItemId(),
                    current.add(total.getMovementType(), total.getReversedType(), total.getTotal()));
        }
        return balances;
    }

    private String format(BigDecimal quantity, UnitOfMeasure unit) {
        String label = unit == UnitOfMeasure.UNIT ? "un" : unit.name().toLowerCase(Locale.ROOT);
        return quantity.stripTrailingZeros().toPlainString() + " " + label;
    }
}