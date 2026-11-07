package br.univille.doabem.beneficiary.controller;

import br.univille.doabem.beneficiary.dto.BeneficiaryRequest;
import br.univille.doabem.beneficiary.dto.BeneficiaryResponse;
import br.univille.doabem.beneficiary.dto.UpdateBeneficiaryStatusRequest;
import br.univille.doabem.common.Status;
import br.univille.doabem.beneficiary.service.BeneficiaryService;
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

// RF22 a RF24 e RN08: dados de famílias acessíveis apenas a perfis internos (Operador e Coordenador).
@RestController
@RequestMapping("/api/beneficiaries")
@PreAuthorize("hasAnyRole('OPERATOR', 'COORDINATOR')")
public class BeneficiaryController {

    private final BeneficiaryService service;

    public BeneficiaryController(BeneficiaryService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BeneficiaryResponse create(@Valid @RequestBody BeneficiaryRequest request) {
        return service.create(request);
    }

    @GetMapping
    public Page<BeneficiaryResponse> list(@RequestParam(required = false) String search,
                                          @RequestParam(required = false) Status status,
                                          @PageableDefault(size = 20, sort = "responsibleName") Pageable pageable) {
        return service.list(search, status, pageable);
    }

    @GetMapping("/{id}")
    public BeneficiaryResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public BeneficiaryResponse update(@PathVariable Long id, @Valid @RequestBody BeneficiaryRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public BeneficiaryResponse setStatus(@PathVariable Long id,
                                         @Valid @RequestBody UpdateBeneficiaryStatusRequest request) {
        return service.setStatus(id, request.status());
    }
}
