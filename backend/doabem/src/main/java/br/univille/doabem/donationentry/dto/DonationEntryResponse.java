package br.univille.doabem.donationentry.dto;

import br.univille.doabem.donationentry.entity.DonationEntry;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record DonationEntryResponse(
        Long id,
        LocalDate entryDate,
        String source,
        boolean anonymous,
        String notes,
        String registeredBy,
        LocalDateTime createdAt,
        List<DonationEntryItemResponse> items
) {

    public static DonationEntryResponse from(DonationEntry entry) {
        return new DonationEntryResponse(
                entry.getId(),
                entry.getEntryDate(),
                entry.getSource(),
                entry.isAnonymous(),
                entry.getNotes(),
                entry.getUser().getName(),
                entry.getCreatedAt(),
                entry.getItems().stream().map(DonationEntryItemResponse::from).toList());
    }
}
