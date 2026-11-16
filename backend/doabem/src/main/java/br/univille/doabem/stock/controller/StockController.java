package br.univille.doabem.stock.controller;

import br.univille.doabem.common.Status;
import br.univille.doabem.stock.dto.CreateAdjustmentRequest;
import br.univille.doabem.stock.dto.StockRowResponse;
import br.univille.doabem.stock.service.StockService;
import br.univille.doabem.stockmovement.dto.MovementResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// RF17 a RF19: consulta de estoque para os dois perfis; ajuste só para o Coordenador.
@RestController
@RequestMapping("/api/stock")
@PreAuthorize("hasAnyRole('OPERATOR', 'COORDINATOR')")
public class StockController {

    private final StockService service;

    public StockController(StockService service) {
        this.service = service;
    }

    @GetMapping
    public List<StockRowResponse> list(@RequestParam(required = false) Status status) {
        return service.list(status);
    }

    @PostMapping("/adjustments")
    @PreAuthorize("hasRole('COORDINATOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public MovementResponse adjust(@Valid @RequestBody CreateAdjustmentRequest request,
                                   @AuthenticationPrincipal Jwt jwt) {
        return service.adjust(request, jwt.getSubject());
    }
}