package br.univille.doabem.donationentry.dto;

import br.univille.doabem.donationentry.entity.DonationEntryItem;
import br.univille.doabem.item.entity.UnitOfMeasure;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DonationEntryItemResponse(
        Long id,
        Long itemId,
        String itemName,
        UnitOfMeasure unitOfMeasure,
        BigDecimal quantity,
        LocalDate expiryDate
) {

    public static DonationEntryItemResponse from(DonationEntryItem line) {
        return new DonationEntryItemResponse(
                line.getId(),
                line.getItem().getId(),
                line.getItem().getName(),
                line.getItem().getUnitOfMeasure(),
                line.getQuantity(),
                line.getExpiryDate());
    }
}
