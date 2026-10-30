package br.univille.doabem.category.service;

import br.univille.doabem.category.dto.CategoryRequest;
import br.univille.doabem.category.dto.CategoryResponse;
import br.univille.doabem.category.entity.Category;
import br.univille.doabem.category.repository.CategoryRepository;
import br.univille.doabem.common.error.ConflictException;
import br.univille.doabem.common.error.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        String name = request.name().trim();
        if (repository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Já existe uma categoria com este nome.");
        }

        Category category = new Category();
        apply(category, name, request.description());
        return CategoryResponse.from(repository.save(category));
    }

    @Transactional(readOnly = true)
    public Page<CategoryResponse> list(Boolean active, Pageable pageable) {
        Page<Category> page = active == null
                ? repository.findAll(pageable)
                : repository.findByActive(active, pageable);
        return page.map(CategoryResponse::from);
    }

    @Transactional(readOnly = true)
    public CategoryResponse get(Long id) {
        return CategoryResponse.from(find(id));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = find(id);
        String name = request.name().trim();
        if (repository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("Já existe uma categoria com este nome.");
        }

        apply(category, name, request.description());
        return CategoryResponse.from(category);
    }

    @Transactional
    public CategoryResponse setActive(Long id, boolean active) {
        Category category = find(id);
        category.setActive(active);
        return CategoryResponse.from(category);
    }

    private Category find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoria não encontrada."));
    }

    private void apply(Category category, String name, String description) {
        category.setName(name);
        category.setDescription(description == null || description.isBlank() ? null : description.trim());
    }
}
