package br.univille.doabem.aidrequest.repository;

import br.univille.doabem.aidrequest.entity.AidRequest;
import br.univille.doabem.aidrequest.entity.AidRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AidRequestRepository
        extends JpaRepository<AidRequest, Long>, JpaSpecificationExecutor<AidRequest> {

    @Override
    @EntityGraph(attributePaths = "beneficiary")
    Page<AidRequest> findAll(Specification<AidRequest> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"beneficiary", "requestedBy", "decidedBy", "pickedBy",
            "cancelledBy", "items", "items.item"})
    Optional<AidRequest> findWithDetailsById(Long id);

    boolean existsByBeneficiaryIdAndStatusIn(Long beneficiaryId, Collection<AidRequestStatus> statuses);

    @EntityGraph(attributePaths = {"requestedBy", "items"})
    List<AidRequest> findByBeneficiaryIdOrderByCreatedAtDesc(Long beneficiaryId);
}