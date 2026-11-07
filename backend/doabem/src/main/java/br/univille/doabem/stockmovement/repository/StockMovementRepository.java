package br.univille.doabem.stockmovement.repository;

import br.univille.doabem.stockmovement.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
}
