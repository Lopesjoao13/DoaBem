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
import br.univille.doabem.aidrequest.entity.AidRequestStatus;
import br.univille.doabem.aidrequest.repository.AidRequestRepository;
import br.univille.doabem.common.error.BusinessRuleException;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class BeneficiaryService {

    private static final List<AidRequestStatus> OPEN_STATUSES = Arrays.stream(AidRequestStatus.values())
            .filter(AidRequestStatus::isOpen)
            .toList();

    private final BeneficiaryRepository repository;
    private final AidRequestRepository requests;

    public BeneficiaryService(BeneficiaryRepository repository, AidRequestRepository requests) {
        this.repository = repository;
        this.requests = requests;
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
        // D-09: não inativa família com solicitação em andamento (pendente, aprovada ou separada).
        if (status == Status.INACTIVE && requests.existsByBeneficiaryIdAndStatusIn(id, OPEN_STATUSES)) {
            throw new BusinessRuleException(
                    "A família tem solicitação em andamento. Conclua ou cancele antes de inativar.");
        }
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
