package br.univille.doabem.aidrequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelRequest(
        @NotBlank(message = "Informe o motivo.")
        @Size(max = 300, message = "O motivo deve ter no máximo 300 caracteres.")
        String reason
) {
}
