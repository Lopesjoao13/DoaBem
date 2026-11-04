package br.univille.doabem.item.dto;

import br.univille.doabem.common.Status;
import jakarta.validation.constraints.NotNull;

public record UpdateItemStatusRequest(
        @NotNull(message = "Informe a situação (ACTIVE ou INACTIVE).")
        Status status
) {
}
