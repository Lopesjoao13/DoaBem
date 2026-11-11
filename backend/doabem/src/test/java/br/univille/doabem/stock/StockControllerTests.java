package br.univille.doabem.stock;

import br.univille.doabem.category.entity.Category;
import br.univille.doabem.common.Status;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.entity.UnitOfMeasure;
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

class StockControllerTests extends ApiTestSupport {

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

    private void receive(Item item, Object quantity) throws Exception {
        Map<String, Object> line = new HashMap<>();
        line.put("itemId", item.getId());
        line.put("quantity", quantity);
        Map<String, Object> body = new HashMap<>();
        body.put("items", List.of(line));
        doPost("/api/donation-entries", operatorToken, body).andExpect(status().isCreated());
    }

    private Map<String, Object> adjustment(Item item, Object quantity) {
        Map<String, Object> body = new HashMap<>();
        body.put("itemId", item.getId());
        body.put("quantity", quantity);
        body.put("adjustmentReason", "DAMAGE");
        body.put("notes", "Embalagem rasgada");
        return body;
    }

    // RF17 e RN03: o saldo vem das movimentações, não de um campo digitado.
    @Test
    void saldoVemDasMovimentacoesDeEntrada() throws Exception {
        receive(arroz, 80.5);
        receive(sabonete, 20);

        doGet("/api/stock", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Arroz"))
                .andExpect(jsonPath("$[0].unitOfMeasure").value("KG"))
                .andExpect(jsonPath("$[0].physical").value(80.5))
                .andExpect(jsonPath("$[0].reserved").value(0.0))
                .andExpect(jsonPath("$[0].available").value(80.5))
                .andExpect(jsonPath("$[1].name").value("Sabonete"))
                .andExpect(jsonPath("$[1].physical").value(20.0));
    }

    // CA11 / RN11: mínimo 10 com saldo 10 já é crítico.
    @Test
    void itemComSaldoIgualAoMinimoEhCritico() throws Exception {
        arroz.setMinStock(new BigDecimal("10"));
        itemRepository.save(arroz);
        receive(arroz, 10);

        doGet("/api/stock", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].level").value("CRITICAL"));
    }

    @Test
    void filtraPorSituacaoDoItem() throws Exception {
        saveItem(arroz.getCategory(), "Feijao antigo", UnitOfMeasure.KG, Status.INACTIVE);

        doGet("/api/stock?status=ACTIVE", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        doGet("/api/stock?status=INACTIVE", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Feijao antigo"));
    }

    @Test
    void consultaDeEstoqueExigeAutenticacao() throws Exception {
        doGet("/api/stock", null).andExpect(status().isUnauthorized());
    }

    // CA07: ajuste "avaria" gera movimentação ADJUSTMENT com usuário e baixa o físico.
    @Test
    void coordenadorRegistraAjusteQueBaixaOSaldo() throws Exception {
        receive(arroz, 10);

        doPost("/api/stock/adjustments", coordinatorToken, adjustment(arroz, 2))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("ADJUSTMENT"))
                .andExpect(jsonPath("$.adjustmentReason").value("DAMAGE"))
                .andExpect(jsonPath("$.reason").value("Embalagem rasgada"))
                .andExpect(jsonPath("$.userName").value("Coord"))
                .andExpect(jsonPath("$.quantity").value(2.0));

        doGet("/api/stock", coordinatorToken)
                .andExpect(jsonPath("$[0].physical").value(8.0))
                .andExpect(jsonPath("$[0].available").value(8.0));
        assertThat(movementRepository.count()).isEqualTo(2);
    }

    // CA08: o Operador não ajusta estoque, nem por chamada direta à API.
    @Test
    void operadorNaoPodeRegistrarAjuste() throws Exception {
        receive(arroz, 10);

        doPost("/api/stock/adjustments", operatorToken, adjustment(arroz, 2))
                .andExpect(status().isForbidden());
        assertThat(movementRepository.count()).isEqualTo(1);
    }

    // RN01: o estoque nunca fica negativo.
    @Test
    void ajusteAcimaDoDisponivelEhRecusado() throws Exception {
        receive(arroz, 1);

        doPost("/api/stock/adjustments", coordinatorToken, adjustment(arroz, 2))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value(
                        "Saldo disponível insuficiente: há 1 kg de \"Arroz\". O estoque não pode ficar negativo."));
        assertThat(movementRepository.count()).isEqualTo(1);
    }

    // RN10: item em UNIT só aceita inteiros.
    @Test
    void ajusteDeItemEmUnidadeExigeQuantidadeInteira() throws Exception {
        receive(sabonete, 10);

        doPost("/api/stock/adjustments", coordinatorToken, adjustment(sabonete, 2.5))
                .andExpect(status().isUnprocessableEntity());
        assertThat(movementRepository.count()).isEqualTo(1);
    }

    // RN14: item inativo não recebe ajustes.
    @Test
    void itemInativoNaoRecebeAjuste() throws Exception {
        receive(arroz, 10);
        arroz.setStatus(Status.INACTIVE);
        itemRepository.save(arroz);

        doPost("/api/stock/adjustments", coordinatorToken, adjustment(arroz, 2))
                .andExpect(status().isUnprocessableEntity());
        assertThat(movementRepository.count()).isEqualTo(1);
    }

    @Test
    void ajusteExigeObservacaoEQuantidadePositiva() throws Exception {
        receive(arroz, 10);

        Map<String, Object> semObservacao = adjustment(arroz, 2);
        semObservacao.put("notes", " ");
        doPost("/api/stock/adjustments", coordinatorToken, semObservacao)
                .andExpect(status().isBadRequest());

        doPost("/api/stock/adjustments", coordinatorToken, adjustment(arroz, 0))
                .andExpect(status().isBadRequest());
        assertThat(movementRepository.count()).isEqualTo(1);
    }

    @Test
    void ajusteDeItemInexistenteRetorna404() throws Exception {
        Map<String, Object> body = adjustment(arroz, 1);
        body.put("itemId", 999999);

        doPost("/api/stock/adjustments", coordinatorToken, body).andExpect(status().isNotFound());
    }
}