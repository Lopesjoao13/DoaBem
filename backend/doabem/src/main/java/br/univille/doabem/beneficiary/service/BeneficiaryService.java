package br.univille.doabem.beneficiary.service;

import br.univille.doabem.common.error.NotFoundException;
import br.univille.doabem.beneficiary.dto.BeneficiaryRequest;
import br.univille.doabem.beneficiary.dto.BeneficiaryResponse;
import br.univille.doabem.beneficiary.entity.Beneficiary;
import br.univille.doabem.common.Status;
import br.univille.doabem.beneficiary.repository.BeneficiaryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class BeneficiaryService {

    private final BeneficiaryRepository repository;

    public BeneficiaryService(BeneficiaryRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public BeneficiaryResponse create(BeneficiaryRequest request) {
        Beneficiary beneficiary = new Beneficiary();
        apply(beneficiary, request);
        return BeneficiaryResponse.from(repository.save(beneficiary));
    }

    @Transactional(readOnly = true)
    public Page<BeneficiaryResponse> list(String search, Status status, Pageable pageable) {
        Specification<Beneficiary> spec = Specification.unrestricted();

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("responsibleName")), pattern));
        }

        return repository.findAll(spec, pageable).map(BeneficiaryResponse::from);
    }

    @Transactional(readOnly = true)
    public BeneficiaryResponse get(Long id) {
        return BeneficiaryResponse.from(find(id));
    }

    @Transactional
    public BeneficiaryResponse update(Long id, BeneficiaryRequest request) {
        Beneficiary beneficiary = find(id);
        apply(beneficiary, request);
        return BeneficiaryResponse.from(beneficiary);
    }

    @Transactional
    public BeneficiaryResponse setStatus(Long id, Status status) {
        Beneficiary beneficiary = find(id);
        beneficiary.setStatus(status);
        return BeneficiaryResponse.from(beneficiary);
    }

    private Beneficiary find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Família não encontrada."));
    }

    private void apply(Beneficiary beneficiary, BeneficiaryRequest request) {
        beneficiary.setResponsibleName(request.responsibleName().trim());
        beneficiary.setPhone(blankToNull(request.phone()));
        beneficiary.setNeighborhood(blankToNull(request.neighborhood()));
        beneficiary.setHouseholdSize(request.householdSize());
        beneficiary.setNotes(blankToNull(request.notes()));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
