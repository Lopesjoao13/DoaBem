package br.univille.doabem.category.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Informe o nome da categoria.")
        @Size(max = 80, message = "O nome da categoria deve ter no máximo 80 caracteres.")
        String name,

        @Size(max = 200, message = "A descrição deve ter no máximo 200 caracteres.")
        String description
) {
}
