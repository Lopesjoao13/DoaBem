package br.univille.doabem.aidrequest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record DecisionRequest(
        @NotNull(message = "Informe a decisão (APPROVE ou REJECT).")
        Decision decision,

        // Obrigatório ao aprovar: uma entrada por linha da solicitação. Ignorado ao recusar.
        @Valid
        List<ApprovedLine> items,

        @Size(max = 300, message = "A justificativa deve ter no máximo 300 caracteres.")
        String justification
) {

    public enum Decision {
        APPROVE,
        REJECT
    }

    public record ApprovedLine(
            @NotNull(message = "Informe a linha da solicitação.")
            Long id,

            @NotNull(message = "Informe a quantidade aprovada.")
            @PositiveOrZero(message = "A quantidade não pode ser negativa.")
            @Digits(integer = 9, fraction = 3, message = "A quantidade aceita até 3 casas decimais.")
            BigDecimal approvedQty
    ) {
    }
}
