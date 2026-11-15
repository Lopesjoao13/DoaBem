package br.univille.doabem.beneficiary.dto;

import br.univille.doabem.delivery.dto.DeliveryRowResponse;

import java.util.List;

public record FamilyHistoryResponse(
        List<RequestHistoryRowResponse> requests,
        List<DeliveryRowResponse> deliveries
) {
}