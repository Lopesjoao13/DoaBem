package br.univille.doabem.stockmovement.dto;

import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.stockmovement.entity.AdjustmentReason;
import br.univille.doabem.stockmovement.entity.MovementType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// RF21: detalhe auditável com o vínculo entre o lançamento original e sua compensação.
public record MovementDetailResponse(
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
        Long reversesId,
        Long reversedById,
        MovementResponse.Reference reference,
        MovementResponse original,
        MovementResponse reversal
) {

    public static MovementDetailResponse of(MovementResponse row, MovementResponse original, MovementResponse reversal) {
        return new MovementDetailResponse(
                row.id(), row.type(), row.occurredAt(), row.itemId(), row.itemName(), row.unitOfMeasure(),
                row.quantity(), row.userId(), row.userName(), row.adjustmentReason(), row.reason(),
                row.reversesId(), row.reversedById(), row.reference(), original, reversal);
    }
}
