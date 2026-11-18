package br.univille.doabem.dashboard.controller;

import br.univille.doabem.dashboard.dto.DashboardResponse;
import br.univille.doabem.dashboard.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

// RF35 e RF36: indicadores para Operador e Coordenador. Sem from/to, usa os últimos 30 dias.
@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasAnyRole('OPERATOR', 'COORDINATOR')")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping
    public DashboardResponse get(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.get(from, to);
    }
}
