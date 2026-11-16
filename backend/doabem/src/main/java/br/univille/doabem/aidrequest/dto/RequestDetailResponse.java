package br.univille.doabem.aidrequest.dto;

import br.univille.doabem.aidrequest.entity.AidRequestStatus;
import br.univille.doabem.beneficiary.dto.DeliverySummaryResponse;
import br.univille.doabem.common.Status;
import br.univille.doabem.item.entity.UnitOfMeasure;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// RF27: detalhe com família, itens solicitados/aprovados, histórico da solicitação e entregas recentes da família.
public record RequestDetailResponse(
        Long id,
        AidRequestStatus status,
        LocalDateTime createdAt,
        Long beneficiaryId,
        String beneficiaryName,
        String requestedBy,
        long itemCount,
        Family beneficiary,
        List<Line> items,
        String decidedBy,
        LocalDateTime decidedAt,
        String justification,
        String pickedBy,
        LocalDateTime pickedAt,
        String cancelledBy,
        LocalDateTime cancelledAt,
        String cancellationReason,
        DeliveryInfo delivery,
        DeliverySummaryResponse familyHistory
) {

    public record Family(
            Long id,
            String responsibleName,
            int householdSize,
            String neighborhood,
            String phone,
            Status status
    ) {
    }

    // available: disponível atual do item, para o Coordenador decidir e o Operador separar com contexto.
    public record Line(
            Long id,
            Long itemId,
            String itemName,
            UnitOfMeasure unitOfMeasure,
            Status itemStatus,
            BigDecimal requestedQty,
            BigDecimal approvedQty,
            BigDecimal available
    ) {
    }

    public record DeliveryInfo(Long id, LocalDateTime deliveredAt, String deliveredBy, String notes) {
    }
}
