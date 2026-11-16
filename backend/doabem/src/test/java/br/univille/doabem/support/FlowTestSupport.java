package br.univille.doabem.support;

import br.univille.doabem.beneficiary.entity.Beneficiary;
import br.univille.doabem.beneficiary.repository.BeneficiaryRepository;
import br.univille.doabem.category.entity.Category;
import br.univille.doabem.common.Status;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.entity.UnitOfMeasure;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Atalhos do fluxo completo (entrada -> solicitação -> análise -> separação -> entrega) para os testes de API.
public abstract class FlowTestSupport extends ApiTestSupport {

    @Autowired
    protected BeneficiaryRepository beneficiaryRepository;

    protected Item arroz;
    protected Item sabonete;
    protected Beneficiary familia;

    @BeforeEach
    void setUpFlow() {
        Category category = saveCategory("Geral", true);
        arroz = saveItem(category, "Arroz", UnitOfMeasure.KG, Status.ACTIVE);
        sabonete = saveItem(category, "Sabonete", UnitOfMeasure.UNIT, Status.ACTIVE);
        familia = saveBeneficiary("Maria Souza", Status.ACTIVE);
    }

    protected Beneficiary saveBeneficiary(String name, Status status) {
        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setResponsibleName(name);
        beneficiary.setHouseholdSize(3);
        beneficiary.setStatus(status);
        return beneficiaryRepository.save(beneficiary);
    }

    // Registra uma entrada de doação com uma linha e devolve o id da entrada.
    protected long receive(Item item, Object quantity) throws Exception {
        Map<String, Object> line = Map.of("itemId", item.getId(), "quantity", quantity);
        return idOf(doPost("/api/donation-entries", operatorToken, Map.of("items", List.of(line)))
                .andExpect(status().isCreated()));
    }

    protected Map<String, Object> requestLine(Item item, Object quantity) {
        return Map.of("itemId", item.getId(), "requestedQty", quantity);
    }

    @SafeVarargs
    protected final long createRequest(Beneficiary beneficiary, Map<String, Object>... lines) throws Exception {
        return idOf(doPost("/api/requests", operatorToken,
                Map.of("beneficiaryId", beneficiary.getId(), "lines", List.of(lines)))
                .andExpect(status().isCreated()));
    }

    // Aprova integralmente: devolve as quantidades solicitadas como aprovadas.
    protected void approveAll(long requestId, Object... approvedByLine) throws Exception {
        var detail = objectMapper.readTree(doGet("/api/requests/" + requestId, coordinatorToken)
                .andReturn().getResponse().getContentAsString());
        List<Map<String, Object>> items = new java.util.ArrayList<>();
        for (int index = 0; index < detail.get("items").size(); index++) {
            var line = detail.get("items").get(index);
            Object approved = approvedByLine.length > index
                    ? approvedByLine[index]
                    : new BigDecimal(line.get("requestedQty").asText());
            items.add(Map.of("id", line.get("id").asLong(), "approvedQty", approved));
        }
        doPost("/api/requests/" + requestId + "/decision", coordinatorToken,
                Map.of("decision", "APPROVE", "items", items, "justification", "ok"))
                .andExpect(status().isOk());
    }
}
