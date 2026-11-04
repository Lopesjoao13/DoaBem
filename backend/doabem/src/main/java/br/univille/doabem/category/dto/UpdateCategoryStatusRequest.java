package br.univille.doabem.category.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateCategoryStatusRequest(
        @NotNull(message = "Informe se a categoria está ativa.")
        Boolean active
) {
}
