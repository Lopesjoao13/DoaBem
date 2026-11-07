package br.univille.doabem.item.controller;

import br.univille.doabem.common.Status;
import br.univille.doabem.item.dto.CreateItemRequest;
import br.univille.doabem.item.dto.ItemResponse;
import br.univille.doabem.item.dto.UpdateItemRequest;
import br.univille.doabem.item.dto.UpdateItemStatusRequest;
import br.univille.doabem.item.service.ItemService;
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

// RF09 a RF11: consulta para os perfis internos; cadastro, edição e inativação só do Coordenador (D-05).
@RestController
@RequestMapping("/api/items")
@PreAuthorize("hasAnyRole('OPERATOR', 'COORDINATOR')")
public class ItemController {

    private final ItemService service;

    public ItemController(ItemService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse create(@Valid @RequestBody CreateItemRequest request) {
        return service.create(request);
    }

    @GetMapping
    public Page<ItemResponse> list(@RequestParam(required = false) String search,
                                   @RequestParam(required = false) Status status,
                                   @RequestParam(required = false) Long categoryId,
                                   @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return service.list(search, status, categoryId, pageable);
    }

    @GetMapping("/{id}")
    public ItemResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ItemResponse update(@PathVariable Long id, @Valid @RequestBody UpdateItemRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ItemResponse setStatus(@PathVariable Long id, @Valid @RequestBody UpdateItemStatusRequest request) {
        return service.setStatus(id, request.status());
    }
}
