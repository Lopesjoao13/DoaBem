package br.univille.doabem.aidrequest.repository;

import br.univille.doabem.aidrequest.entity.AidRequest;
import br.univille.doabem.aidrequest.entity.AidRequestStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AidRequestRepository
        extends JpaRepository<AidRequest, Long>, JpaSpecificationExecutor<AidRequest> {

    @Override
    @EntityGraph(attributePaths = {"beneficiary", "requestedBy"})
    Page<AidRequest> findAll(Specification<AidRequest> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"beneficiary", "requestedBy", "decidedBy", "pickedBy",
            "cancelledBy", "items", "items.item"})
    Optional<AidRequest> findWithDetailsById(Long id);

    // RNF03: serializa as transições da mesma solicitação (duas separações simultâneas não reservam em dobro).
    // Sem EntityGraph: FOR UPDATE não combina com fetch join no PostgreSQL.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from AidRequest r where r.id = :id")
    Optional<AidRequest> findByIdForUpdate(@Param("id") Long id);

    long countByStatus(AidRequestStatus status);

    // Dashboard: as pendentes mais antigas primeiro.
    @EntityGraph(attributePaths = "beneficiary")
    List<AidRequest> findTop5ByStatusOrderByCreatedAtAscIdAsc(AidRequestStatus status);

    boolean existsByBeneficiaryIdAndStatusIn(Long beneficiaryId, Collection<AidRequestStatus> statuses);

    @EntityGraph(attributePaths = {"requestedBy", "items"})
    List<AidRequest> findByBeneficiaryIdOrderByCreatedAtDesc(Long beneficiaryId);
}