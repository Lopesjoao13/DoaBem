package br.univille.doabem.beneficiary.dto;

import br.univille.doabem.aidrequest.entity.AidRequest;
import br.univille.doabem.aidrequest.entity.AidRequestStatus;

import java.time.LocalDateTime;

public record RequestHistoryRowResponse(
        Long id,
        AidRequestStatus status,
        LocalDateTime createdAt,
        String requestedBy,
        int itemCount
) {

    public static RequestHistoryRowResponse from(AidRequest request) {
        return new RequestHistoryRowResponse(
                request.getId(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getRequestedBy().getName(),
                request.getItems().size());
    }
}