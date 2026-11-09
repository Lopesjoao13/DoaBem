package br.univille.doabem.stock.dto;

import br.univille.doabem.stockmovement.entity.AdjustmentReason;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

// RF19: saída por ajuste com motivo predefinido e observação obrigatória.
public record CreateAdjustmentRequest(
        @NotNull(message = "Informe o item.")
        Long itemId,

        @NotNull(message = "Informe a quantidade.")
        @Positive(message = "A quantidade deve ser maior que zero.")
        @Digits(integer = 9, fraction = 3, message = "A quantidade aceita até 3 casas decimais.")
        BigDecimal quantity,

        @NotNull(message = "Informe o motivo do ajuste.")
        AdjustmentReason adjustmentReason,

        @NotBlank(message = "Informe uma observação.")
        @Size(max = 300, message = "A observação deve ter no máximo 300 caracteres.")
        String notes
) {
}