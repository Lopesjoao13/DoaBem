package br.univille.doabem.item.repository;

import br.univille.doabem.item.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {

    boolean existsByCategoryIdAndNameIgnoreCase(Long categoryId, String name);

    boolean existsByCategoryIdAndNameIgnoreCaseAndIdNot(Long categoryId, String name, Long id);

    // Carrega a categoria junto, evitando N+1 na listagem (RNF10).
    @Override
    @EntityGraph(attributePaths = "category")
    Page<Item> findAll(Specification<Item> spec, Pageable pageable);
}
