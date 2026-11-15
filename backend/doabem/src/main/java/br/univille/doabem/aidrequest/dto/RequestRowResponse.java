package br.univille.doabem.aidrequest.dto;

import br.univille.doabem.aidrequest.entity.AidRequest;
import br.univille.doabem.aidrequest.entity.AidRequestStatus;

import java.time.LocalDateTime;

public record RequestRowResponse(
        Long id,
        AidRequestStatus status,
        LocalDateTime createdAt,
        Long beneficiaryId,
        String beneficiaryName,
        String requestedBy,
        long itemCount
) {

    public static RequestRowResponse of(AidRequest request, long itemCount) {
        return new RequestRowResponse(
                request.getId(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getBeneficiary().getId(),
                request.getBeneficiary().getResponsibleName(),
                request.getRequestedBy().getName(),
                itemCount);
    }
}
