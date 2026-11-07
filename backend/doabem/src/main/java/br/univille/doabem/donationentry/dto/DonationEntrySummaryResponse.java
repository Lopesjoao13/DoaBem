package br.univille.doabem.donationentry.dto;

import br.univille.doabem.donationentry.entity.DonationEntry;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Versão da listagem: sem os itens, que ficam no detalhe (GET /api/donation-entries/{id}).
public record DonationEntrySummaryResponse(
        Long id,
        LocalDate entryDate,
        String source,
        boolean anonymous,
        String registeredBy,
        LocalDateTime createdAt
) {

    public static DonationEntrySummaryResponse from(DonationEntry entry) {
        return new DonationEntrySummaryResponse(
                entry.getId(),
                entry.getEntryDate(),
                entry.getSource(),
                entry.isAnonymous(),
                entry.getUser().getName(),
                entry.getCreatedAt());
    }
}
