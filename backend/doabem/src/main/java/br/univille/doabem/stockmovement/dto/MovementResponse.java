package br.univille.doabem.stockmovement.dto;

import br.univille.doabem.aidrequest.entity.AidRequest;
import br.univille.doabem.donationentry.entity.DonationEntry;
import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.stockmovement.entity.AdjustmentReason;
import br.univille.doabem.stockmovement.entity.MovementType;
import br.univille.doabem.stockmovement.entity.StockMovement;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// reversedById: estorno que compensa este lançamento (RF21). reference: de onde o lançamento nasceu (RF20).
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
        Long reversesId,
        Long reversedById,
        Reference reference
) {

    private static final String ANONYMOUS_SOURCE = "Doação anônima/não informado";

    // label é o texto pronto para a tela; entryId e requestId levam ao detalhe da origem.
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Reference(String label, Long entryId, Long requestId) {
    }

    public static MovementResponse from(StockMovement movement) {
        return from(movement, null);
    }

    public static MovementResponse from(StockMovement movement, Long reversedById) {
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
                movement.getReverses() == null ? null : movement.getReverses().getId(),
                reversedById,
                referenceOf(movement));
    }

    private static Reference referenceOf(StockMovement movement) {
        switch (movement.getType()) {
            case ENTRY -> {
                if (movement.getDonationEntryItem() == null) {
                    return new Reference("Entrada", null, null);
                }
                DonationEntry entry = movement.getDonationEntryItem().getDonationEntry();
                String source = entry.isAnonymous() || entry.getSource() == null || entry.getSource().isBlank()
                        ? ANONYMOUS_SOURCE : entry.getSource();
                return new Reference("Entrada #" + entry.getId() + " — " + source, entry.getId(), null);
            }
            case ADJUSTMENT -> {
                return new Reference("Ajuste — " + label(movement.getAdjustmentReason()), null, null);
            }
            case REVERSAL -> {
                return new Reference("Estorno do lançamento #" + movement.getReverses().getId(), null, null);
            }
            default -> {
                // DELIVERY, RESERVE e RELEASE nascem de uma solicitação.
                if (movement.getAidRequestItem() == null) {
                    return new Reference("Solicitação", null, null);
                }
                AidRequest request = movement.getAidRequestItem().getAidRequest();
                return new Reference(
                        "Solicitação #" + request.getId() + " — " + request.getBeneficiary().getResponsibleName(),
                        null, request.getId());
            }
        }
    }

    private static String label(AdjustmentReason reason) {
        if (reason == null) {
            return "";
        }
        return switch (reason) {
            case LOSS -> "Perda";
            case DAMAGE -> "Avaria";
            case EXPIRATION -> "Vencimento";
            case TRANSFER -> "Transferência/doação";
        };
    }
}
