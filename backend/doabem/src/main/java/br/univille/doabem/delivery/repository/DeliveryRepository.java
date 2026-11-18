package br.univille.doabem.delivery.repository;

import br.univille.doabem.delivery.entity.Delivery;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    // Dashboard: entregas concluídas no intervalo [start, end).
    long countByDeliveredAtGreaterThanEqualAndDeliveredAtLessThan(LocalDateTime start, LocalDateTime end);

    @Query("select d.deliveredAt from Delivery d where d.deliveredAt >= :start and d.deliveredAt < :end")
    List<LocalDateTime> findDeliveredAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
