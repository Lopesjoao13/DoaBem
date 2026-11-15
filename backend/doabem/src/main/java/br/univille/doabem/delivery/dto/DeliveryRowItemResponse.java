package br.univille.doabem.delivery.dto;

import br.univille.doabem.delivery.entity.DeliveryItem;
import br.univille.doabem.item.entity.UnitOfMeasure;

import java.math.BigDecimal;

public record DeliveryRowItemResponse(
        Long id,
        String itemName,
        UnitOfMeasure unitOfMeasure,
        BigDecimal quantity
) {

    public static DeliveryRowItemResponse from(DeliveryItem deliveryItem) {
        var item = deliveryItem.getAidRequestItem().getItem();
        return new DeliveryRowItemResponse(
                deliveryItem.getId(),
                item.getName(),
                item.getUnitOfMeasure(),
                deliveryItem.getDeliveredQty());
    }
}