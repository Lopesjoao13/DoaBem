package br.univille.doabem.stockmovement.controller;

import br.univille.doabem.stockmovement.dto.MovementDetailResponse;
import br.univille.doabem.stockmovement.dto.MovementResponse;
import br.univille.doabem.stockmovement.dto.ReverseRequest;
import br.univille.doabem.stockmovement.entity.MovementType;
import br.univille.doabem.stockmovement.service.MovementService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

// RF20 e RF21: Operador e Coordenador consultam; só o Coordenador estorna (matriz 2.1).
@RestController
@RequestMapping("/api/movements")
@PreAuthorize("hasAnyRole('OPERATOR', 'COORDINATOR')")
public class MovementController {

    private final MovementService service;

    public MovementController(MovementService service) {
        this.service = service;
    }

    @GetMapping
    public Page<MovementResponse> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) MovementType type,
            @RequestParam(required = false) Long userId,
            @PageableDefault(size = 20, sort = {"occurredAt", "id"}, direction = Sort.Direction.DESC) Pageable pageable) {
        return service.list(from, to, itemId, type, userId, pageable);
    }

    @GetMapping("/{id}")
    public MovementDetailResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping("/{id}/reverse")
    @PreAuthorize("hasRole('COORDINATOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public MovementResponse reverse(@PathVariable Long id,
                                    @Valid @RequestBody ReverseRequest request,
                                    @AuthenticationPrincipal Jwt jwt) {
        return service.reverse(id, request, jwt.getSubject());
    }
}
