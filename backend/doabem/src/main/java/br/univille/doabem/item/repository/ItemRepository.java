package br.univille.doabem.item.repository;

import br.univille.doabem.common.Status;
import br.univille.doabem.item.entity.Item;
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

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {

    boolean existsByCategoryIdAndNameIgnoreCase(Long categoryId, String name);

    boolean existsByCategoryIdAndNameIgnoreCaseAndIdNot(Long categoryId, String name, Long id);

    // Carrega a categoria junto, evitando N+1 na listagem (RF-NFR RNF10).
    @Override
    @EntityGraph(attributePaths = "category")
    Page<Item> findAll(Specification<Item> spec, Pageable pageable);

    @EntityGraph(attributePaths = "category")
    List<Item> findAllByOrderByNameAsc();

    @EntityGraph(attributePaths = "category")
    List<Item> findByStatusOrderByNameAsc(Status status);

    // SELECT ... FOR UPDATE: serializa quem mexe no saldo do mesmo item (RNF03).
    // Só funciona dentro de uma transação.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Item i where i.id = :id")
    Optional<Item> findByIdForUpdate(@Param("id") Long id);
}