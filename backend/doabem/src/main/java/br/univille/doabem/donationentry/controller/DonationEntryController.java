package br.univille.doabem.donationentry.controller;

import br.univille.doabem.donationentry.dto.CreateDonationEntryRequest;
import br.univille.doabem.donationentry.dto.DonationEntryResponse;
import br.univille.doabem.donationentry.dto.DonationEntrySummaryResponse;
import br.univille.doabem.donationentry.service.DonationEntryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// RF12 a RF16: Operador e Coordenador registram e consultam entradas de doação.
@RestController
@RequestMapping("/api/donation-entries")
@PreAuthorize("hasAnyRole('OPERATOR', 'COORDINATOR')")
public class DonationEntryController {

    private final DonationEntryService service;

    public DonationEntryController(DonationEntryService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DonationEntryResponse create(@Valid @RequestBody CreateDonationEntryRequest request,
                                        @AuthenticationPrincipal Jwt jwt) {
        return service.create(request, jwt.getSubject());
    }

    @GetMapping
    public Page<DonationEntrySummaryResponse> list(
            @PageableDefault(size = 20, sort = {"entryDate", "id"}, direction = Sort.Direction.DESC) Pageable pageable) {
        return service.list(pageable);
    }

    @GetMapping("/{id}")
    public DonationEntryResponse get(@PathVariable Long id) {
        return service.get(id);
    }
}
