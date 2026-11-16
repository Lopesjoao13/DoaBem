package br.univille.doabem.aidrequest.controller;

import br.univille.doabem.aidrequest.dto.CancelRequest;
import br.univille.doabem.aidrequest.dto.CreateAidRequestRequest;
import br.univille.doabem.aidrequest.dto.DecisionRequest;
import br.univille.doabem.aidrequest.dto.DeliverRequest;
import br.univille.doabem.aidrequest.dto.RequestActionResponse;
import br.univille.doabem.aidrequest.dto.RequestDetailResponse;
import br.univille.doabem.aidrequest.dto.RequestListResponse;
import br.univille.doabem.aidrequest.entity.AidRequestStatus;
import br.univille.doabem.aidrequest.service.AidRequestService;
import jakarta.validation.Valid;
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

// RF26 a RF34. Operador e Coordenador operam o fluxo; só o Coordenador analisa (RF28, matriz 2.1).
@RestController
@RequestMapping("/api/requests")
@PreAuthorize("hasAnyRole('OPERATOR', 'COORDINATOR')")
public class AidRequestController {

    private final AidRequestService service;

    public AidRequestController(AidRequestService service) {
        this.service = service;
    }

    @GetMapping
    public RequestListResponse list(
            @RequestParam(required = false) AidRequestStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long requestedById,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = {"createdAt", "id"}, direction = Sort.Direction.DESC) Pageable pageable) {
        return service.list(status, from, to, requestedById, search, pageable);
    }

    @GetMapping("/{id}")
    public RequestDetailResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RequestActionResponse create(@Valid @RequestBody CreateAidRequestRequest request,
                                        @AuthenticationPrincipal Jwt jwt) {
        return service.create(request, jwt.getSubject());
    }

    @PostMapping("/{id}/decision")
    @PreAuthorize("hasRole('COORDINATOR')")
    public RequestActionResponse decide(@PathVariable Long id,
                                        @Valid @RequestBody DecisionRequest request,
                                        @AuthenticationPrincipal Jwt jwt) {
        return service.decide(id, request, jwt.getSubject());
    }

    @PostMapping("/{id}/pick")
    public RequestActionResponse pick(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return service.pick(id, jwt.getSubject());
    }

    @PostMapping("/{id}/deliver")
    public RequestActionResponse deliver(@PathVariable Long id,
                                         @Valid @RequestBody(required = false) DeliverRequest request,
                                         @AuthenticationPrincipal Jwt jwt) {
        return service.deliver(id, request, jwt.getSubject());
    }

    // Quem pode cancelar depende do estado (D-04); a regra fica no serviço.
    @PostMapping("/{id}/cancel")
    public RequestActionResponse cancel(@PathVariable Long id,
                                        @Valid @RequestBody CancelRequest request,
                                        @AuthenticationPrincipal Jwt jwt) {
        return service.cancel(id, request, jwt.getSubject(), jwt.getClaimAsString("role"));
    }
}
