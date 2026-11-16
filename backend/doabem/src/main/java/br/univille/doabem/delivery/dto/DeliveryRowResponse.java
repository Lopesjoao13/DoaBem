package br.univille.doabem.delivery.dto;

import br.univille.doabem.delivery.entity.Delivery;

import java.time.LocalDateTime;
import java.util.List;

public record DeliveryRowResponse(
        Long id,
        Long requestId,
        LocalDateTime deliveredAt,
        String deliveredBy,
        List<DeliveryRowItemResponse> items
) {

    public static DeliveryRowResponse from(Delivery delivery) {
        return new DeliveryRowResponse(
                delivery.getId(),
                delivery.getAidRequest().getId(),
                delivery.getDeliveredAt(),
                delivery.getDeliveredBy().getName(),
                delivery.getItems().stream().map(DeliveryRowItemResponse::from).toList());
    }
}