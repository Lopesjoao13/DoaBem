package br.univille.doabem.beneficiary.service;

import br.univille.doabem.aidrequest.repository.AidRequestRepository;
import br.univille.doabem.beneficiary.dto.DeliverySummaryResponse;
import br.univille.doabem.beneficiary.dto.FamilyHistoryResponse;
import br.univille.doabem.beneficiary.dto.RequestHistoryRowResponse;
import br.univille.doabem.beneficiary.repository.BeneficiaryRepository;
import br.univille.doabem.common.error.NotFoundException;
import br.univille.doabem.delivery.dto.DeliveryRowResponse;
import br.univille.doabem.delivery.repository.DeliveryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

// RF24 (resumo de entregas) e RF25 (histórico da família).
@Service
public class BeneficiaryHistoryService {

    static final int RECENT_DELIVERY_DAYS = 30;

    private final BeneficiaryRepository beneficiaries;
    private final AidRequestRepository requests;
    private final DeliveryRepository deliveries;

    public BeneficiaryHistoryService(BeneficiaryRepository beneficiaries,
                                     AidRequestRepository requests,
                                     DeliveryRepository deliveries) {
        this.beneficiaries = beneficiaries;
        this.requests = requests;
        this.deliveries = deliveries;
    }

    @Transactional(readOnly = true)
    public DeliverySummaryResponse deliverySummary(Long beneficiaryId) {
        ensureExists(beneficiaryId);
        List<DeliveryRowResponse> rows = deliveryRows(beneficiaryId);
        LocalDateTime since = LocalDateTime.now().minusDays(RECENT_DELIVERY_DAYS);
        return new DeliverySummaryResponse(
                rows.isEmpty() ? null : rows.get(0),
                rows.stream().filter(row -> !row.deliveredAt().isBefore(since)).toList());
    }

    @Transactional(readOnly = true)
    public FamilyHistoryResponse history(Long beneficiaryId) {
        ensureExists(beneficiaryId);
        List<RequestHistoryRowResponse> requestRows = requests
                .findByBeneficiaryIdOrderByCreatedAtDesc(beneficiaryId).stream()
                .map(RequestHistoryRowResponse::from)
                .toList();
        return new FamilyHistoryResponse(requestRows, deliveryRows(beneficiaryId));
    }

    private List<DeliveryRowResponse> deliveryRows(Long beneficiaryId) {
        return deliveries.findByAidRequestBeneficiaryIdOrderByDeliveredAtDesc(beneficiaryId).stream()
                .map(DeliveryRowResponse::from)
                .toList();
    }

    private void ensureExists(Long beneficiaryId) {
        if (!beneficiaries.existsById(beneficiaryId)) {
            throw new NotFoundException("Família não encontrada.");
        }
    }
}