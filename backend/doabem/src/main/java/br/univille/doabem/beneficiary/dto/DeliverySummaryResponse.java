package br.univille.doabem.beneficiary.dto;

import br.univille.doabem.delivery.dto.DeliveryRowResponse;

import java.util.List;

// RF24: apoio à decisão; "recentDeliveries" não bloqueia a solicitação.
public record DeliverySummaryResponse(
        DeliveryRowResponse lastDelivery,
        List<DeliveryRowResponse> recentDeliveries
) {
}