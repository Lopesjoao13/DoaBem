package br.univille.doabem.donationentry.repository;

import br.univille.doabem.donationentry.entity.DonationEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DonationEntryRepository extends JpaRepository<DonationEntry, Long> {

    // Carrega o responsável junto, evitando N+1 na listagem (RNF10).
    @Override
    @EntityGraph(attributePaths = "user")
    Page<DonationEntry> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user", "items", "items.item"})
    Optional<DonationEntry> findWithDetailsById(Long id);
}
