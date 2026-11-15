package br.univille.doabem.delivery.repository;

import br.univille.doabem.delivery.entity.Delivery;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    @EntityGraph(attributePaths = {"deliveredBy", "items", "items.aidRequestItem",
            "items.aidRequestItem.item"})
    Optional<Delivery> findWithDetailsByAidRequestId(Long aidRequestId);

    boolean existsByAidRequestId(Long aidRequestId);

    @EntityGraph(attributePaths = "deliveredBy")
    Optional<Delivery> findFirstByAidRequestBeneficiaryIdOrderByDeliveredAtDesc(Long beneficiaryId);

    List<Delivery> findByAidRequestBeneficiaryIdAndDeliveredAtAfterOrderByDeliveredAtDesc(
            Long beneficiaryId, LocalDateTime after);

    @EntityGraph(attributePaths = {"deliveredBy", "items", "items.aidRequestItem",
            "items.aidRequestItem.item"})
    List<Delivery> findByAidRequestBeneficiaryIdOrderByDeliveredAtDesc(Long beneficiaryId);
}