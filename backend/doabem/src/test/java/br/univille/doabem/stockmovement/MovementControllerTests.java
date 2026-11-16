package br.univille.doabem.stockmovement;

import br.univille.doabem.item.entity.Item;
import br.univille.doabem.stockmovement.entity.AdjustmentReason;
import br.univille.doabem.stockmovement.entity.MovementType;
import br.univille.doabem.stockmovement.entity.StockMovement;
import br.univille.doabem.stockmovement.repository.StockMovementRepository;
import br.univille.doabem.support.FlowTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasKey;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MovementControllerTests extends FlowTestSupport {

    @Autowired
    private StockMovementRepository movementRepository;

    private void assertAvailable(Item item, double available) throws Exception {
        doGet("/api/stock", coordinatorToken)
                .andExpect(jsonPath("$[?(@.itemId==" + item.getId() + ")].available").value(available));
    }

    private long firstMovementId(MovementType type) {
        return movementRepository.findAll().stream().filter(m -> m.getType() == type)
                .findFirst().orElseThrow().getId();
    }

    private void saveAdjustment(Item item, int quantity, AdjustmentReason reason) throws Exception {
        doPost("/api/stock/adjustments", coordinatorToken, Map.of(
                "itemId", item.getId(), "quantity", quantity,
                "adjustmentReason", reason.name(), "notes", "Caixa molhada"))
                .andExpect(status().isCreated());
    }

    private long deliverRequest(Item item, int quantity) throws Exception {
        long id = createRequest(familia, requestLine(item, quantity));
        approveAll(id);
        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of()).andExpect(status().isOk());
        doPost("/api/requests/" + id + "/deliver", operatorToken, Map.of()).andExpect(status().isOk());
        return id;
    }

    // ----------------------------------------------------------------- listagem e detalhe

    @Test
    void listaApenasOsQuatroTiposDoPOComReferenciaEPaginacao() throws Exception {
        long entryId = receive(arroz, 50);
        long requestId = deliverRequest(arroz, 10);
        saveAdjustment(arroz, 2, AdjustmentReason.DAMAGE);

        // ENTRY + DELIVERY + ADJUSTMENT; RESERVE e RELEASE ficam fora (D-08).
        doGet("/api/movements", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(3))
                .andExpect(jsonPath("$.page.totalElements").value(3))
                .andExpect(jsonPath("$.page.totalPages").value(1))
                .andExpect(jsonPath("$.page.number").value(0))
                .andExpect(jsonPath("$.content[?(@.type=='ENTRY')].reference.label")
                        .value("Entrada #" + entryId + " — Doação anônima/não informado"))
                .andExpect(jsonPath("$.content[?(@.type=='ENTRY')].reference.entryId").value((int) entryId))
                .andExpect(jsonPath("$.content[?(@.type=='DELIVERY')].reference.label")
                        .value("Solicitação #" + requestId + " — Maria Souza"))
                .andExpect(jsonPath("$.content[?(@.type=='DELIVERY')].reference.requestId").value((int) requestId))
                .andExpect(jsonPath("$.content[?(@.type=='ADJUSTMENT')].reference.label").value("Ajuste — Avaria"))
                .andExpect(jsonPath("$.content[0].itemName").value("Arroz"))
                .andExpect(jsonPath("$.content[0].unitOfMeasure").value("KG"));

        doGet("/api/movements?size=1&page=2", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.page.size").value(1))
                .andExpect(jsonPath("$.page.number").value(2))
                .andExpect(jsonPath("$.page.totalPages").value(3));
    }

    @Test
    void ordenaDoMaisRecentePeloMenosRecenteEPermitePaginaGrande() throws Exception {
        receive(arroz, 10);
        receive(arroz, 20);

        doGet("/api/movements?size=1000", operatorToken)
                .andExpect(jsonPath("$.content[0].quantity").value(20))
                .andExpect(jsonPath("$.content[1].quantity").value(10))
                .andExpect(jsonPath("$.page.size").value(1000));
    }

    @Test
    void filtrosPorItemTipoUsuarioEPeriodo() throws Exception {
        receive(arroz, 50);
        receive(sabonete, 10);
        saveAdjustment(arroz, 1, AdjustmentReason.LOSS);
        long coordId = userRepository.findByEmail("coord@test.local").orElseThrow().getId();
        long operId = userRepository.findByEmail("oper@test.local").orElseThrow().getId();

        doGet("/api/movements?itemId=" + sabonete.getId(), operatorToken)
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].itemName").value("Sabonete"));
        doGet("/api/movements?type=ADJUSTMENT", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(1));
        doGet("/api/movements?type=ENTRY", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(2));
        doGet("/api/movements?userId=" + coordId, operatorToken)
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].userName").value("Coord"));
        doGet("/api/movements?userId=" + operId, operatorToken)
                .andExpect(jsonPath("$.content.length()").value(2));
        doGet("/api/movements?from=2999-01-01", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(0))
                .andExpect(jsonPath("$.page.totalElements").value(0));
        doGet("/api/movements?to=2000-01-01", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(0));
        doGet("/api/movements?from=2000-01-01&to=2999-12-31", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(3));
        // Reserva e liberação não são listadas, nem quando pedidas explicitamente.
        doGet("/api/movements?type=RESERVE", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(0));
    }

    @Test
    void parametrosInvalidosRetornam400() throws Exception {
        doGet("/api/movements?type=XYZ", operatorToken).andExpect(status().isBadRequest());
        doGet("/api/movements?itemId=abc", operatorToken).andExpect(status().isBadRequest());
        doGet("/api/movements?from=ontem", operatorToken).andExpect(status().isBadRequest());
        doGet("/api/movements?sort=naoExiste", operatorToken).andExpect(status().isBadRequest());
    }

    @Test
    void semTokenRetorna401() throws Exception {
        doGet("/api/movements", null).andExpect(status().isUnauthorized());
    }

    @Test
    void detalheMostraOVinculoEntreOriginalEEstorno() throws Exception {
        receive(arroz, 50);
        long entry = firstMovementId(MovementType.ENTRY);

        doGet("/api/movements/" + entry, operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entry))
                .andExpect(jsonPath("$.original").doesNotExist())
                .andExpect(jsonPath("$.reversal").doesNotExist())
                .andExpect(jsonPath("$.reversedById").doesNotExist());

        long reversal = idOf(doPost("/api/movements/" + entry + "/reverse", coordinatorToken,
                Map.of("justification", "Lançada por engano")).andExpect(status().isCreated()));

        doGet("/api/movements/" + entry, operatorToken)
                .andExpect(jsonPath("$.reversedById").value(reversal))
                .andExpect(jsonPath("$.reversal.id").value(reversal))
                .andExpect(jsonPath("$.reversal.type").value("REVERSAL"))
                .andExpect(jsonPath("$.original").doesNotExist());
        doGet("/api/movements/" + reversal, operatorToken)
                .andExpect(jsonPath("$.type").value("REVERSAL"))
                .andExpect(jsonPath("$.reversesId").value(entry))
                .andExpect(jsonPath("$.reason").value("Lançada por engano"))
                .andExpect(jsonPath("$.reference.label").value("Estorno do lançamento #" + entry))
                .andExpect(jsonPath("$.original.id").value(entry))
                .andExpect(jsonPath("$.original.reversedById").value(reversal))
                .andExpect(jsonPath("$.reversal").doesNotExist());
    }

    @Test
    void detalheInexistenteRetorna404() throws Exception {
        doGet("/api/movements/999999", operatorToken).andExpect(status().isNotFound());
    }

    // ----------------------------------------------------------------- estorno (CA07)

    @Test
    void operadorNaoEstorna() throws Exception {
        receive(arroz, 50);

        doPost("/api/movements/" + firstMovementId(MovementType.ENTRY) + "/reverse", operatorToken,
                Map.of("justification", "x")).andExpect(status().isForbidden());
        assertThat(movementRepository.count()).isEqualTo(1);
    }

    @Test
    void estornoExigeJustificativa() throws Exception {
        receive(arroz, 50);
        long entry = firstMovementId(MovementType.ENTRY);

        doPost("/api/movements/" + entry + "/reverse", coordinatorToken, Map.of())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors", hasKey("justification")));
        doPost("/api/movements/" + entry + "/reverse", coordinatorToken, Map.of("justification", "   "))
                .andExpect(status().isBadRequest());
        assertThat(movementRepository.count()).isEqualTo(1);
    }

    @Test
    void estornoDeEntradaDevolveOSaldoEImpedeEstornoDuplo() throws Exception {
        receive(arroz, 50);
        long entry = firstMovementId(MovementType.ENTRY);

        doPost("/api/movements/" + entry + "/reverse", coordinatorToken, Map.of("justification", "Engano"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("REVERSAL"))
                .andExpect(jsonPath("$.reversesId").value(entry))
                .andExpect(jsonPath("$.userName").value("Coord"))
                .andExpect(jsonPath("$.quantity").value(50));
        assertAvailable(arroz, 0);

        doPost("/api/movements/" + entry + "/reverse", coordinatorToken, Map.of("justification", "De novo"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Este lançamento já foi estornado."));
        assertThat(movementRepository.count()).isEqualTo(2);
    }

    @Test
    void estornoDeEntradaSemSaldoDisponivelEhRecusado() throws Exception {
        receive(arroz, 50);
        long entry = firstMovementId(MovementType.ENTRY);
        long request = createRequest(familia, requestLine(arroz, 40));
        approveAll(request);
        doPost("/api/requests/" + request + "/pick", operatorToken, Map.of()).andExpect(status().isOk());

        // 50 físico - 40 reservado = 10 disponível < 50 da entrada
        doPost("/api/movements/" + entry + "/reverse", coordinatorToken, Map.of("justification", "Engano"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Saldo disponível insuficiente")));
        assertAvailable(arroz, 10);
    }

    @Test
    void estornoDeEntradaRecusadoQuandoOSaldoJaFoiConsumidoPorEntrega() throws Exception {
        receive(arroz, 50);
        long entry = firstMovementId(MovementType.ENTRY);
        deliverRequest(arroz, 30);

        doPost("/api/movements/" + entry + "/reverse", coordinatorToken, Map.of("justification", "Engano"))
                .andExpect(status().isUnprocessableEntity());
        assertAvailable(arroz, 20);
    }

    @Test
    void estornoDeEntregaExigeConfirmarQueOsItensRetornaram() throws Exception {
        receive(arroz, 50);
        deliverRequest(arroz, 30);
        long delivery = firstMovementId(MovementType.DELIVERY);
        assertAvailable(arroz, 20);

        doPost("/api/movements/" + delivery + "/reverse", coordinatorToken, Map.of("justification", "Devolvido"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors", hasKey("itemsReturned")));
        doPost("/api/movements/" + delivery + "/reverse", coordinatorToken,
                Map.of("justification", "Devolvido", "itemsReturned", false))
                .andExpect(status().isBadRequest());
        assertAvailable(arroz, 20);

        doPost("/api/movements/" + delivery + "/reverse", coordinatorToken,
                Map.of("justification", "Devolvido", "itemsReturned", true))
                .andExpect(status().isCreated());
        assertAvailable(arroz, 50);
        doGet("/api/stock", coordinatorToken)
                .andExpect(jsonPath("$[0].reserved").value(0));
    }

    @Test
    void estornoDeAjusteDevolveOSaldo() throws Exception {
        receive(arroz, 10);
        saveAdjustment(arroz, 4, AdjustmentReason.LOSS);
        assertAvailable(arroz, 6);

        doPost("/api/movements/" + firstMovementId(MovementType.ADJUSTMENT) + "/reverse", coordinatorToken,
                Map.of("justification", "Contagem errada")).andExpect(status().isCreated());

        assertAvailable(arroz, 10);
    }

    @Test
    void reservaLiberacaoEEstornoNaoPodemSerEstornados() throws Exception {
        receive(arroz, 50);
        long request = createRequest(familia, requestLine(arroz, 10));
        approveAll(request);
        doPost("/api/requests/" + request + "/pick", operatorToken, Map.of());
        long reserve = firstMovementId(MovementType.RESERVE);

        doPost("/api/movements/" + reserve + "/reverse", coordinatorToken, Map.of("justification", "x"))
                .andExpect(status().isConflict());

        // Uma entrada pequena, que o disponível (50 - 10 reservados) ainda cobre.
        receive(arroz, 5);
        long smallEntry = movementRepository.findAll().stream()
                .filter(m -> m.getType() == MovementType.ENTRY && m.getQuantity().compareTo(BigDecimal.valueOf(5)) == 0)
                .findFirst().orElseThrow().getId();
        long reversal = idOf(doPost("/api/movements/" + smallEntry + "/reverse", coordinatorToken,
                Map.of("justification", "x")).andExpect(status().isCreated()));
        doPost("/api/movements/" + reversal + "/reverse", coordinatorToken, Map.of("justification", "x"))
                .andExpect(status().isConflict());
    }

    @Test
    void estornoInexistenteRetorna404() throws Exception {
        doPost("/api/movements/999999/reverse", coordinatorToken, Map.of("justification", "x"))
                .andExpect(status().isNotFound());
    }

    // O original é imutável (RN07): estornar não altera a movimentação original.
    @Test
    void estornoNaoAlteraOLancamentoOriginal() throws Exception {
        receive(arroz, 50);
        long entry = firstMovementId(MovementType.ENTRY);
        StockMovement before = movementRepository.findById(entry).orElseThrow();

        doPost("/api/movements/" + entry + "/reverse", coordinatorToken, Map.of("justification", "Engano"));

        StockMovement after = movementRepository.findById(entry).orElseThrow();
        assertThat(after.getQuantity()).isEqualByComparingTo(before.getQuantity());
        assertThat(after.getType()).isEqualTo(MovementType.ENTRY);
        assertThat(after.getOccurredAt()).isEqualTo(before.getOccurredAt());
    }
}
