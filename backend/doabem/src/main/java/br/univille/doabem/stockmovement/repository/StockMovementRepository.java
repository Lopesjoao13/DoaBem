package br.univille.doabem.stockmovement.repository;

import br.univille.doabem.stockmovement.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

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
}