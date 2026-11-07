package br.univille.doabem.item.dto;

import br.univille.doabem.item.entity.UnitOfMeasure;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateItemRequest(
        @NotNull(message = "Informe a categoria.")
        Long categoryId,

        @NotBlank(message = "Informe o nome do item.")
        @Size(max = 120, message = "O nome do item deve ter no máximo 120 caracteres.")
        String name,

        @NotNull(message = "Informe a unidade de medida (UNIT, KG ou L).")
        UnitOfMeasure unitOfMeasure,

        // Opcional: padrão 0 (Q04).
        @PositiveOrZero(message = "O estoque mínimo não pode ser negativo.")
        @Digits(integer = 9, fraction = 3, message = "O estoque mínimo aceita até 3 casas decimais.")
        BigDecimal minStock
) {
}
