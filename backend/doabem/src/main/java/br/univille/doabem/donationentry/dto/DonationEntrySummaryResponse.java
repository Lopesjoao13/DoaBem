package br.univille.doabem.donationentry.dto;

import br.univille.doabem.donationentry.entity.DonationEntry;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Versão da listagem: sem quantidades, que ficam no detalhe (GET /api/donation-entries/{id}).
// receivedItems permite filtrar a lista por item sem abrir cada entrada.
public record DonationEntrySummaryResponse(
        Long id,
        LocalDate entryDate,
        String source,
        boolean anonymous,
        String registeredBy,
        LocalDateTime createdAt,
        List<ReceivedItem> receivedItems
) {

    public record ReceivedItem(Long itemId, String itemName) {
    }

    public static DonationEntrySummaryResponse from(DonationEntry entry, List<ReceivedItem> receivedItems) {
        return new DonationEntrySummaryResponse(
                entry.getId(),
                entry.getEntryDate(),
                entry.getSource(),
                entry.isAnonymous(),
                entry.getUser().getName(),
                entry.getCreatedAt(),
                receivedItems);
    }
}
