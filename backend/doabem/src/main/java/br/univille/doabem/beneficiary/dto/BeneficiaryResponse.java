package br.univille.doabem.beneficiary.dto;

import br.univille.doabem.beneficiary.entity.Beneficiary;
import br.univille.doabem.common.Status;

import java.time.LocalDateTime;

public record BeneficiaryResponse(
        Long id,
        String responsibleName,
        String phone,
        String neighborhood,
        int householdSize,
        String notes,
        Status status,
        LocalDateTime createdAt
) {

    public static BeneficiaryResponse from(Beneficiary beneficiary) {
        return new BeneficiaryResponse(
                beneficiary.getId(),
                beneficiary.getResponsibleName(),
                beneficiary.getPhone(),
                beneficiary.getNeighborhood(),
                beneficiary.getHouseholdSize(),
                beneficiary.getNotes(),
                beneficiary.getStatus(),
                beneficiary.getCreatedAt());
    }
}
