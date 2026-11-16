package br.univille.doabem.donationentry.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record CreateDonationEntryRequest(
        // Opcional: padrão é a data de hoje.
        LocalDate entryDate,

        // Doador em texto livre, opcional (RN24). Ignorado quando a doação é anônima.
        @Size(max = 160, message = "A origem deve ter no máximo 160 caracteres.")
        String source,

        boolean anonymous,

        @Size(max = 300, message = "As observações devem ter no máximo 300 caracteres.")
        String notes,

        @NotEmpty(message = "Informe ao menos um item.")
        @Valid
        List<DonationEntryItemRequest> items
) {
}
