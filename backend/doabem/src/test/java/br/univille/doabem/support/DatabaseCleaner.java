package br.univille.doabem.support;

import br.univille.doabem.beneficiary.repository.BeneficiaryRepository;
import br.univille.doabem.category.repository.CategoryRepository;
import br.univille.doabem.donationentry.repository.DonationEntryRepository;
import br.univille.doabem.item.repository.ItemRepository;
import br.univille.doabem.stockmovement.repository.StockMovementRepository;
import br.univille.doabem.user.repository.AppUserRepository;
import org.springframework.stereotype.Component;

// Os testes compartilham o mesmo H2 em memória; apaga na ordem das chaves estrangeiras.
@Component
public class DatabaseCleaner {

    private final StockMovementRepository movements;
    private final DonationEntryRepository entries;
    private final ItemRepository items;
    private final CategoryRepository categories;
    private final BeneficiaryRepository beneficiaries;
    private final AppUserRepository users;

    public DatabaseCleaner(StockMovementRepository movements,
                           DonationEntryRepository entries,
                           ItemRepository items,
                           CategoryRepository categories,
                           BeneficiaryRepository beneficiaries,
                           AppUserRepository users) {
        this.movements = movements;
        this.entries = entries;
        this.items = items;
        this.categories = categories;
        this.beneficiaries = beneficiaries;
        this.users = users;
    }

    public void clean() {
        movements.deleteAllInBatch();
        entries.deleteAll();
        items.deleteAllInBatch();
        categories.deleteAllInBatch();
        beneficiaries.deleteAllInBatch();
        users.deleteAllInBatch();
    }
}
