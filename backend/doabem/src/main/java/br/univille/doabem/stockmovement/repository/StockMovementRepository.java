package br.univille.doabem.stockmovement.repository;

import br.univille.doabem.stockmovement.entity.MovementType;
import br.univille.doabem.stockmovement.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface StockMovementRepository
        extends JpaRepository<StockMovement, Long>, JpaSpecificationExecutor<StockMovement> {

    @Query("""
            select m.item.id as itemId, m.type as movementType, r.type as reversedType, sum(m.quantity) as total
            from StockMovement m left join m.reverses r
            group by m.item.id, m.type, r.type
            """)
    List<MovementTotal> totalsByItem();

    @Query("""
            select m.item.id as itemId, m.type as movementType, r.type as reversedType, sum(m.quantity) as total
            from StockMovement m left join m.reverses r
            where m.item.id = :itemId
            group by m.item.id, m.type, r.type
            """)
    List<MovementTotal> totalsForItem(@Param("itemId") Long itemId);

    @Query("""
            select m.item.id as itemId, m.type as movementType, r.type as reversedType, sum(m.quantity) as total
            from StockMovement m left join m.reverses r
            where m.item.id in :itemIds
            group by m.item.id, m.type, r.type
            """)
    List<MovementTotal> totalsForItems(@Param("itemIds") Collection<Long> itemIds);

    // Histórico (RF20): tudo o que a linha exibe vem na mesma consulta, sem N+1 (RNF10).
    @Override
    @EntityGraph(attributePaths = {"item", "user", "donationEntryItem.donationEntry",
            "aidRequestItem.aidRequest.beneficiary"})
    Page<StockMovement> findAll(Specification<StockMovement> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"item", "user", "reverses", "donationEntryItem.donationEntry",
            "aidRequestItem.aidRequest.beneficiary"})
    Optional<StockMovement> findWithReferenceById(Long id);

    boolean existsByReversesId(Long reversesId);

    // Estorno que compensa cada lançamento: [lançamento original, estorno].
    @Query("select m.reverses.id, m.id from StockMovement m where m.reverses.id in :ids")
    List<Object[]> findReversalIds(@Param("ids") Collection<Long> ids);

    @EntityGraph(attributePaths = {"item", "user"})
    List<StockMovement> findTop6ByTypeInOrderByOccurredAtDescIdDesc(Collection<MovementType> types);
}
