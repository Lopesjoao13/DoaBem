package br.univille.doabem.donationentry;

import br.univille.doabem.category.entity.Category;
import br.univille.doabem.common.Status;
import br.univille.doabem.donationentry.repository.DonationEntryRepository;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.stockmovement.entity.MovementType;
import br.univille.doabem.stockmovement.entity.StockMovement;
import br.univille.doabem.stockmovement.repository.StockMovementRepository;
import br.univille.doabem.support.ApiTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DonationEntryControllerTests extends ApiTestSupport {

    @Autowired
    private DonationEntryRepository entryRepository;
    @Autowired
    private StockMovementRepository movementRepository;

    private Item arroz;
    private Item sabonete;

    @BeforeEach
    void setUpItems() {
        Category category = saveCategory("Geral", true);
        arroz = saveItem(category, "Arroz", UnitOfMeasure.KG, Status.ACTIVE);
        sabonete = saveItem(category, "Sabonete", UnitOfMeasure.UNIT, Status.ACTIVE);
    }

    private Map<String, Object> line(Item item, Object quantity) {
        Map<String, Object> line = new HashMap<>();
        line.put("itemId", item.getId());
        line.put("quantity", quantity);
        return line;
    }

    private Map<String, Object> entry(Object... lines) {
        Map<String, Object> body = new HashMap<>();
        body.put("items", List.of(lines));
        return body;
    }

    private void assertNothingPersisted() {
        assertThat(entryRepository.count()).isZero();
        assertThat(movementRepository.count()).isZero();
    }

    // CA01: entrada com 80,5 kg e 20 un gera duas movimentações ENTRY na mesma transação.
    @Test
    void entradaComVariosItensGeraUmaMovimentacaoEntryPorLinha() throws Exception {
        doPost("/api/donation-entries", operatorToken, entry(line(arroz, 80.5), line(sabonete, 20)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.registeredBy").value("Oper"))
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].itemName").value("Arroz"))
                .andExpect(jsonPath("$.items[0].quantity").value(80.5))
                .andExpect(jsonPath("$.items[1].unitOfMeasure").value("UNIT"));

        List<StockMovement> movements = movementRepository.findAll();
        assertThat(movements).hasSize(2);
        assertThat(movements).allSatisfy(m -> assertThat(m.getType()).isEqualTo(MovementType.ENTRY));
        assertThat(movements).extracting(StockMovement::getQuantity)
                .usingComparatorForType(BigDecimal::compareTo, BigDecimal.class)
                .containsExactlyInAnyOrder(new BigDecimal("80.5"), new BigDecimal("20"));
    }

    @Test
    void coordenadorTambemRegistra() throws Exception {
        doPost("/api/donation-entries", coordinatorToken, entry(line(arroz, 10)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.registeredBy").value("Coord"));
    }

    @Test
    void quantidadeFracionadaEmUnidadeRecusaAEntradaInteira() throws Exception {
        doPost("/api/donation-entries", operatorToken, entry(line(arroz, 10), line(sabonete, 2.5)))
                .andExpect(status().isUnprocessableEntity());

        assertNothingPersisted();
    }

    @Test
    void quantidadeZeroOuNegativaRetorna400() throws Exception {
        doPost("/api/donation-entries", operatorToken, entry(line(arroz, 0))).andExpect(status().isBadRequest());
        doPost("/api/donation-entries", operatorToken, entry(line(arroz, -3))).andExpect(status().isBadRequest());
        doPost("/api/donation-entries", operatorToken, entry(line(arroz, 1.2345))).andExpect(status().isBadRequest());

        assertNothingPersisted();
    }

    @Test
    void entradaSemItensRetorna400() throws Exception {
        doPost("/api/donation-entries", operatorToken, entry()).andExpect(status().isBadRequest());

        assertNothingPersisted();
    }

    @Test
    void itemInativoOuInexistenteRecusaAEntradaInteira() throws Exception {
        Item inativo = saveItem(arroz.getCategory(), "Feijão", UnitOfMeasure.KG, Status.INACTIVE);

        doPost("/api/donation-entries", operatorToken, entry(line(arroz, 10), line(inativo, 5)))
                .andExpect(status().isUnprocessableEntity());

        Map<String, Object> inexistente = line(arroz, 1);
        inexistente.put("itemId", 999999);
        doPost("/api/donation-entries", operatorToken, entry(line(arroz, 10), inexistente))
                .andExpect(status().isNotFound());

        assertNothingPersisted();
    }

    @Test
    void doacaoAnonimaIgnoraAOrigem() throws Exception {
        Map<String, Object> body = entry(line(arroz, 10));
        body.put("source", "Maria");
        body.put("anonymous", true);

        doPost("/api/donation-entries", operatorToken, body)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.anonymous").value(true))
                .andExpect(jsonPath("$.source").doesNotExist());
    }

    @Test
    void origemEValidadeSaoOpcionaisEGravadasQuandoInformadas() throws Exception {
        Map<String, Object> comValidade = line(arroz, 10);
        comValidade.put("expiryDate", "2027-03-15");
        Map<String, Object> body = entry(comValidade, line(sabonete, 4));
        body.put("source", " Mercado Central ");
        body.put("entryDate", "2026-10-20");
        body.put("notes", "Doação de campanha");

        doPost("/api/donation-entries", operatorToken, body)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.source").value("Mercado Central"))
                .andExpect(jsonPath("$.entryDate").value("2026-10-20"))
                .andExpect(jsonPath("$.items[0].expiryDate").value("2027-03-15"))
                .andExpect(jsonPath("$.items[1].expiryDate").doesNotExist());
    }

    @Test
    void semTokenRetorna401() throws Exception {
        doPost("/api/donation-entries", null, entry(line(arroz, 10))).andExpect(status().isUnauthorized());
        doGet("/api/donation-entries", null).andExpect(status().isUnauthorized());
    }

    @Test
    void listaEDetalhaAsEntradas() throws Exception {
        long primeira = idOf(doPost("/api/donation-entries", operatorToken, entry(line(arroz, 10))));
        doPost("/api/donation-entries", coordinatorToken, entry(line(arroz, 5), line(sabonete, 3)));

        doGet("/api/donation-entries", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].items").doesNotExist());

        doGet("/api/donation-entries/" + primeira, operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registeredBy").value("Oper"))
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].itemName").value("Arroz"))
                .andExpect(jsonPath("$.items[0].quantity").value(10));

        doGet("/api/donation-entries/999999", operatorToken).andExpect(status().isNotFound());
    }
}
