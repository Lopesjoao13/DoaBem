package br.univille.doabem.category.controller;

import br.univille.doabem.category.dto.CategoryRequest;
import br.univille.doabem.category.dto.CategoryResponse;
import br.univille.doabem.category.dto.UpdateCategoryStatusRequest;
import br.univille.doabem.category.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// RF08: consulta para os perfis internos; cadastro, edição e inativação só do Coordenador (D-05).
@RestController
@RequestMapping("/api/categories")
@PreAuthorize("hasAnyRole('OPERATOR', 'COORDINATOR')")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(@Valid @RequestBody CategoryRequest request) {
        return service.create(request);
    }

    @GetMapping
    public Page<CategoryResponse> list(@RequestParam(required = false) Boolean active,
                                       @PageableDefault(size = 100, sort = "name") Pageable pageable) {
        return service.list(active, pageable);
    }

    @GetMapping("/{id}")
    public CategoryResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('COORDINATOR')")
    public CategoryResponse setStatus(@PathVariable Long id,
                                      @Valid @RequestBody UpdateCategoryStatusRequest request) {
        return service.setActive(id, request.active());
    }
}
