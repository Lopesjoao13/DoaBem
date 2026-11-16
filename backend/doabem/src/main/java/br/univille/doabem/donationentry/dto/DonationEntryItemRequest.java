package br.univille.doabem.donationentry.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DonationEntryItemRequest(
        @NotNull(message = "Informe o item.")
        Long itemId,

        @NotNull(message = "Informe a quantidade.")
        @Positive(message = "A quantidade deve ser maior que zero.")
        @Digits(integer = 9, fraction = 3, message = "A quantidade aceita até 3 casas decimais.")
        BigDecimal quantity,

        // Opcional e meramente informativa (RN12): sem lote, sem alertas.
        LocalDate expiryDate
) {
}
