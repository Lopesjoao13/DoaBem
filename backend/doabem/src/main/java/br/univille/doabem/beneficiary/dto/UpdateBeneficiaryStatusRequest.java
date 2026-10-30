package br.univille.doabem.beneficiary.dto;

import br.univille.doabem.common.Status;
import jakarta.validation.constraints.NotNull;

public record UpdateBeneficiaryStatusRequest(
        @NotNull(message = "Informe a situação (ACTIVE ou INACTIVE).")
        Status status
) {
}
