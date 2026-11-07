package br.univille.doabem.beneficiary.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// RN25: dados mínimos da família; sem CPF, renda, nascimento, endereço completo ou dependentes.
public record BeneficiaryRequest(
        @NotBlank(message = "Informe o nome do responsável.")
        @Size(max = 120, message = "O nome do responsável deve ter no máximo 120 caracteres.")
        String responsibleName,

        @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres.")
        String phone,

        @Size(max = 80, message = "O bairro deve ter no máximo 80 caracteres.")
        String neighborhood,

        @NotNull(message = "Informe o número de integrantes.")
        @Min(value = 1, message = "O número de integrantes deve ser pelo menos 1.")
        Integer householdSize,

        @Size(max = 300, message = "As observações devem ter no máximo 300 caracteres.")
        String notes
) {
}
