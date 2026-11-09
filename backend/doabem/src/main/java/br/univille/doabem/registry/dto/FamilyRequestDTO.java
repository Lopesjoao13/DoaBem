package br.univille.doabem.registry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

public record FamilyRequestDTO(
        @NotBlank(message = "O nome do responsável é obrigatório.")
        String representativeName,

        @NotBlank(message = "O CPF é obrigatório.")
        @Pattern(regexp = "\\d{11}", message = "O CPF deve conter exatamente 11 dígitos numéricos.")
        String cpf,

        @NotBlank(message = "O telefone de contato é obrigatório.")
        String phone,

        @NotBlank(message = "O endereço é obrigatório.")
        String address,

        @NotBlank(message = "O bairro é obrigatório.")
        String meighborhood,

        @NotNull(message = " O número de dependentes é obrigatório.")
        @PositiveOrZero(message = "O número de dependentes não pode ser negativo.")
        Integer dependentsCount
) {}