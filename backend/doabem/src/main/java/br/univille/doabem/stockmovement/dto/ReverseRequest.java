package br.univille.doabem.stockmovement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReverseRequest(
        @NotBlank(message = "Informe a justificativa.")
        @Size(max = 300, message = "A justificativa deve ter no máximo 300 caracteres.")
        String justification,

        // Só vale para estorno de entrega (RN22): confirma que os itens voltaram à instituição.
        boolean itemsReturned
) {
}
