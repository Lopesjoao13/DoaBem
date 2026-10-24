package br.univille.doabem.user.dto;

import br.univille.doabem.user.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @NotBlank(message = "Informe o nome.")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
        String name,

        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "E-mail inválido.")
        @Size(max = 160, message = "O e-mail deve ter no máximo 160 caracteres.")
        String email,

        @NotNull(message = "Informe o perfil.")
        Role role
) {
}
