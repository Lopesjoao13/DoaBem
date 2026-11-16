package br.univille.doabem.beneficiary;

import br.univille.doabem.aidrequest.entity.AidRequest;
import br.univille.doabem.aidrequest.entity.AidRequestItem;
import br.univille.doabem.aidrequest.entity.AidRequestStatus;
import br.univille.doabem.aidrequest.repository.AidRequestRepository;
import br.univille.doabem.beneficiary.entity.Beneficiary;
import br.univille.doabem.beneficiary.repository.BeneficiaryRepository;
import br.univille.doabem.category.entity.Category;
import br.univille.doabem.common.Status;
import br.univille.doabem.delivery.entity.Delivery;
import br.univille.doabem.delivery.entity.DeliveryItem;
import br.univille.doabem.delivery.repository.DeliveryRepository;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.support.ApiTestSupport;
import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.entity.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FamilyHistoryTests extends ApiTestSupport {

    @Autowired
    private BeneficiaryRepository beneficiaryRepository;
    @Autowired
    private AidRequestRepository requestRepository;
    @Autowired
    private DeliveryRepository deliveryRepository;

    private Beneficiary family;
    private AppUser requester;
    private Item rice;

    @BeforeEach
    void setUpFamily() {
        family = new Beneficiary();
        family.setResponsibleName("Maria Souza");
        family.setHouseholdSize(4);
        family = beneficiaryRepository.save(family);

        requester = saveUser("Atendente", "atendente@test.local", Role.OPERATOR);
        Category category = saveCategory("Alimentos", true);
        rice = saveItem(category, "Arroz", UnitOfMeasure.KG, Status.ACTIVE);
    }

    private AidRequest saveRequest(AidRequestStatus requestStatus) {
        AidRequest request = new AidRequest();
        request.setBeneficiary(family);
        request.setRequestedBy(requester);
        request.setStatus(requestStatus);

        AidRequestItem line = new AidRequestItem();
        line.setItem(rice);
        line.setRequestedQty(new BigDecimal("5"));
        line.setApprovedQty(new BigDecimal("5"));
        request.addItem(line);
        return requestRepository.save(request);
    }

    private Delivery saveDelivery(AidRequest request, LocalDateTime deliveredAt) {
        Delivery delivery = new Delivery();
        delivery.setAidRequest(request);
        delivery.setDeliveredBy(requester);
        delivery.setDeliveredAt(deliveredAt);

        DeliveryItem line = new DeliveryItem();
        line.setAidRequestItem(request.getItems().get(0));
        line.setDeliveredQty(new BigDecimal("5"));
        delivery.addItem(line);
        return deliveryRepository.save(delivery);
    }

    @Test
    void summaryWithoutDeliveriesIsEmpty() throws Exception {
        doGet("/api/beneficiaries/" + family.getId() + "/delivery-summary", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastDelivery").doesNotExist())
                .andExpect(jsonPath("$.recentDeliveries").isEmpty());
    }

    @Test
    void summaryReturnsLastAndRecentDeliveries() throws Exception {
        saveDelivery(saveRequest(AidRequestStatus.DELIVERED), LocalDateTime.now().minusDays(60));
        AidRequest recent = saveRequest(AidRequestStatus.DELIVERED);
        saveDelivery(recent, LocalDateTime.now().minusDays(5));

        doGet("/api/beneficiaries/" + family.getId() + "/delivery-summary", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastDelivery.requestId").value(recent.getId()))
                .andExpect(jsonPath("$.lastDelivery.deliveredBy").value("Atendente"))
                .andExpect(jsonPath("$.lastDelivery.items[0].itemName").value("Arroz"))
                .andExpect(jsonPath("$.recentDeliveries.length()").value(1));
    }

    @Test
    void historyListsRequestsAndDeliveries() throws Exception {
        saveRequest(AidRequestStatus.PENDING);
        saveDelivery(saveRequest(AidRequestStatus.DELIVERED), LocalDateTime.now().minusDays(2));

        doGet("/api/beneficiaries/" + family.getId() + "/requests", coordinatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requests.length()").value(2))
                .andExpect(jsonPath("$.requests[0].requestedBy").value("Atendente"))
                .andExpect(jsonPath("$.requests[0].itemCount").value(1))
                .andExpect(jsonPath("$.deliveries.length()").value(1));
    }

    @Test
    void unknownFamilyReturns404() throws Exception {
        doGet("/api/beneficiaries/999999/delivery-summary", operatorToken)
                .andExpect(status().isNotFound());
        doGet("/api/beneficiaries/999999/requests", operatorToken)
                .andExpect(status().isNotFound());
    }

    @Test
    void historyRequiresAuthentication() throws Exception {
        doGet("/api/beneficiaries/" + family.getId() + "/requests", null)
                .andExpect(status().isUnauthorized());
    }

    @Test
    void cannotInactivateFamilyWithOpenRequest() throws Exception {
        saveRequest(AidRequestStatus.APPROVED);

        doPatch("/api/beneficiaries/" + family.getId() + "/status", operatorToken,
                Map.of("status", "INACTIVE"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message")
                        .value("A família tem solicitação em andamento. Conclua ou cancele antes de inativar."));
    }

    @Test
    void canInactivateFamilyWhenRequestsAreClosed() throws Exception {
        saveRequest(AidRequestStatus.DELIVERED);
        saveRequest(AidRequestStatus.CANCELLED);

        doPatch("/api/beneficiaries/" + family.getId() + "/status", operatorToken,
                Map.of("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }
}