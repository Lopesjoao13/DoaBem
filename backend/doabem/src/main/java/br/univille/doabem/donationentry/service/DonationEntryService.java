package br.univille.doabem.donationentry.service;

import br.univille.doabem.common.Status;
import br.univille.doabem.common.error.BusinessRuleException;
import br.univille.doabem.common.error.NotFoundException;
import br.univille.doabem.donationentry.dto.CreateDonationEntryRequest;
import br.univille.doabem.donationentry.dto.DonationEntryItemRequest;
import br.univille.doabem.donationentry.dto.DonationEntryResponse;
import br.univille.doabem.donationentry.dto.DonationEntrySummaryResponse;
import br.univille.doabem.donationentry.entity.DonationEntry;
import br.univille.doabem.donationentry.entity.DonationEntryItem;
import br.univille.doabem.donationentry.repository.DonationEntryRepository;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.repository.ItemRepository;
import br.univille.doabem.stockmovement.entity.MovementType;
import br.univille.doabem.stockmovement.entity.StockMovement;
import br.univille.doabem.stockmovement.repository.StockMovementRepository;
import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.repository.AppUserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DonationEntryService {

    private final DonationEntryRepository entryRepository;
    private final ItemRepository itemRepository;
    private final StockMovementRepository movementRepository;
    private final AppUserRepository userRepository;

    public DonationEntryService(DonationEntryRepository entryRepository,
                                ItemRepository itemRepository,
                                StockMovementRepository movementRepository,
                                AppUserRepository userRepository) {
        this.entryRepository = entryRepository;
        this.itemRepository = itemRepository;
        this.movementRepository = movementRepository;
        this.userRepository = userRepository;
    }

    // RN23: transação única. Qualquer linha inválida desfaz a entrada inteira e suas movimentações.
    @Transactional
    public DonationEntryResponse create(CreateDonationEntryRequest request, String userEmail) {
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        DonationEntry entry = new DonationEntry();
        entry.setUser(user);
        entry.setEntryDate(request.entryDate());
        entry.setAnonymous(request.anonymous());
        entry.setSource(request.anonymous() ? null : blankToNull(request.source()));
        entry.setNotes(blankToNull(request.notes()));

        for (DonationEntryItemRequest line : request.items()) {
            Item item = itemRepository.findById(line.itemId())
                    .orElseThrow(() -> new NotFoundException("Item não encontrado (id " + line.itemId() + ")."));
            validate(item, line);

            DonationEntryItem entryItem = new DonationEntryItem();
            entryItem.setItem(item);
            entryItem.setQuantity(line.quantity());
            entryItem.setExpiryDate(line.expiryDate());
            entry.addItem(entryItem);
        }

        DonationEntry saved = entryRepository.save(entry);

        // RN02/RN03: o saldo nasce das movimentações; cada linha gera exatamente uma ENTRY.
        for (DonationEntryItem entryItem : saved.getItems()) {
            StockMovement movement = new StockMovement();
            movement.setItem(entryItem.getItem());
            movement.setType(MovementType.ENTRY);
            movement.setQuantity(entryItem.getQuantity());
            movement.setUser(user);
            movement.setDonationEntryItem(entryItem);
            movementRepository.save(movement);
        }

        return DonationEntryResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<DonationEntrySummaryResponse> list(Pageable pageable) {
        return entryRepository.findAll(pageable).map(DonationEntrySummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public DonationEntryResponse get(Long id) {
        return entryRepository.findWithDetailsById(id)
                .map(DonationEntryResponse::from)
                .orElseThrow(() -> new NotFoundException("Entrada não encontrada."));
    }

    private void validate(Item item, DonationEntryItemRequest line) {
        if (item.getStatus() != Status.ACTIVE) {
            throw new BusinessRuleException("O item \"" + item.getName() + "\" está inativo e não pode receber entradas.");
        }
        if (!item.getUnitOfMeasure().accepts(line.quantity())) {
            throw new BusinessRuleException("Quantidade inválida para o item \"" + item.getName() + "\": itens em "
                    + item.getUnitOfMeasure() + " aceitam " + item.getUnitOfMeasure().getQuantityRule() + ".");
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
