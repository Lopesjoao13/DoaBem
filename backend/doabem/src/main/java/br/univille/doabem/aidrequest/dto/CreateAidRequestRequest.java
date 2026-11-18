package br.univille.doabem.aidrequest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public record CreateAidRequestRequest(
        @NotNull(message = "Informe a família.")
        Long beneficiaryId,

        @NotEmpty(message = "Adicione pelo menos um item.")
        @Valid
        List<Line> lines
) {

    public record Line(
            @NotNull(message = "Informe o item.")
            Long itemId,

            @NotNull(message = "Informe a quantidade.")
            @Positive(message = "A quantidade deve ser maior que zero.")
            @Digits(integer = 9, fraction = 3, message = "A quantidade aceita até 3 casas decimais.")
            BigDecimal requestedQty
    ) {
    }
}
