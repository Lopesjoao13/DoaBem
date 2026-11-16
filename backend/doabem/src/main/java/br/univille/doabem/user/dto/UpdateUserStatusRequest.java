package br.univille.doabem.user.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateUserStatusRequest(
        @NotNull(message = "Informe se o usuário está ativo.")
        Boolean active
) {
}
