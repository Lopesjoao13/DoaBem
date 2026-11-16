package br.univille.doabem.donationentry.repository;

import br.univille.doabem.donationentry.entity.DonationEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface DonationEntryRepository extends JpaRepository<DonationEntry, Long> {

    // Carrega o responsável junto, evitando N+1 na listagem (RNF10).
    @Override
    @EntityGraph(attributePaths = "user")
    Page<DonationEntry> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "items", "items.item"})
    Optional<DonationEntry> findWithDetailsById(Long id);

    // Dashboard (RF35): entradas no período.
    long countByEntryDateBetween(LocalDate from, LocalDate to);

    @Query("select e.entryDate from DonationEntry e where e.entryDate between :from and :to")
    List<LocalDate> findEntryDatesBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    // Itens recebidos por entrada, para a página inteira de uma vez: [entryId, itemId, itemName].
    @Query("select di.donationEntry.id, di.item.id, di.item.name from DonationEntryItem di "
            + "where di.donationEntry.id in :entryIds order by di.id")
    List<Object[]> findReceivedItems(@Param("entryIds") Collection<Long> entryIds);
}
