package br.univille.doabem.item.service;

import br.univille.doabem.category.entity.Category;
import br.univille.doabem.category.repository.CategoryRepository;
import br.univille.doabem.common.Status;
import br.univille.doabem.common.error.BusinessRuleException;
import br.univille.doabem.common.error.ConflictException;
import br.univille.doabem.common.error.NotFoundException;
import br.univille.doabem.item.dto.CreateItemRequest;
import br.univille.doabem.item.dto.ItemResponse;
import br.univille.doabem.item.dto.UpdateItemRequest;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.item.repository.ItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Locale;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;

    public ItemService(ItemRepository itemRepository, CategoryRepository categoryRepository) {
        this.itemRepository = itemRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public ItemResponse create(CreateItemRequest request) {
        Category category = findActiveCategory(request.categoryId());
        String name = request.name().trim();
        if (itemRepository.existsByCategoryIdAndNameIgnoreCase(category.getId(), name)) {
            throw new ConflictException("Já existe um item com este nome nesta categoria.");
        }
        BigDecimal minStock = request.minStock() == null ? BigDecimal.ZERO : request.minStock();
        validateScale(minStock, request.unitOfMeasure());

        Item item = new Item();
        item.setCategory(category);
        item.setName(name);
        item.setUnitOfMeasure(request.unitOfMeasure());
        item.setMinStock(minStock);
        return ItemResponse.from(itemRepository.save(item));
    }

    @Transactional(readOnly = true)
    public Page<ItemResponse> list(String search, Status status, Long categoryId, Pageable pageable) {
        Specification<Item> spec = Specification.unrestricted();

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        }
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), pattern));
        }

        return itemRepository.findAll(spec, pageable).map(ItemResponse::from);
    }

    @Transactional(readOnly = true)
    public ItemResponse get(Long id) {
        return ItemResponse.from(find(id));
    }

    @Transactional
    public ItemResponse update(Long id, UpdateItemRequest request) {
        Item item = find(id);
        Category category = findActiveCategory(request.categoryId());
        String name = request.name().trim();
        if (itemRepository.existsByCategoryIdAndNameIgnoreCaseAndIdNot(category.getId(), name, id)) {
            throw new ConflictException("Já existe um item com este nome nesta categoria.");
        }
        validateScale(request.minStock(), item.getUnitOfMeasure());

        item.setCategory(category);
        item.setName(name);
        item.setMinStock(request.minStock());
        return ItemResponse.from(item);
    }

    @Transactional
    public ItemResponse setStatus(Long id, Status status) {
        Item item = find(id);
        item.setStatus(status);
        return ItemResponse.from(item);
    }

    private Item find(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Item não encontrado."));
    }

    private Category findActiveCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada."));
        if (!category.isActive()) {
            throw new BusinessRuleException("A categoria está inativa e não pode receber itens.");
        }
        return category;
    }

    private void validateScale(BigDecimal minStock, UnitOfMeasure unit) {
        if (!unit.accepts(minStock)) {
            throw new BusinessRuleException(
                    "Estoque mínimo inválido: itens em " + unit + " aceitam " + unit.getQuantityRule() + ".");
        }
    }
}
