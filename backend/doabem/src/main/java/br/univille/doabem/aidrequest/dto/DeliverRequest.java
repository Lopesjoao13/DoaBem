package br.univille.doabem.aidrequest.dto;

import jakarta.validation.constraints.Size;

public record DeliverRequest(
        @Size(max = 300, message = "A observação deve ter no máximo 300 caracteres.")
        String notes
) {
}
