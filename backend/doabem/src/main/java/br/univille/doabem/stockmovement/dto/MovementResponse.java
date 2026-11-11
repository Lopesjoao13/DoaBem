package br.univille.doabem.stockmovement.dto;

import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.stockmovement.entity.AdjustmentReason;
import br.univille.doabem.stockmovement.entity.MovementType;
import br.univille.doabem.stockmovement.entity.StockMovement;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovementResponse(
        Long id,
        MovementType type,
        LocalDateTime occurredAt,
        Long itemId,
        String itemName,
        UnitOfMeasure unitOfMeasure,
        BigDecimal quantity,
        Long userId,
        String userName,
        AdjustmentReason adjustmentReason,
        String reason,
        Long reversesId
) {

    public static MovementResponse from(StockMovement movement) {
        return new MovementResponse(
                movement.getId(),
                movement.getType(),
                movement.getOccurredAt(),
                movement.getItem().getId(),
                movement.getItem().getName(),
                movement.getItem().getUnitOfMeasure(),
                movement.getQuantity(),
                movement.getUser().getId(),
                movement.getUser().getName(),
                movement.getAdjustmentReason(),
                movement.getReason(),
                movement.getReverses() == null ? null : movement.getReverses().getId());
    }
}