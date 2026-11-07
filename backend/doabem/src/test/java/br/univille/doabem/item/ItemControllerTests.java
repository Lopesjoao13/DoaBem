package br.univille.doabem.item;

import br.univille.doabem.category.entity.Category;
import br.univille.doabem.common.Status;
import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.support.ApiTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ItemControllerTests extends ApiTestSupport {

    private Category alimentos;
    private Category higiene;

    @BeforeEach
    void setUpCategories() {
        alimentos = saveCategory("Alimentos", true);
        higiene = saveCategory("Higiene", true);
    }

    private Map<String, Object> newItem(Category category, String name, String unit, Object minStock) {
        Map<String, Object> body = new HashMap<>();
        body.put("categoryId", category.getId());
        body.put("name", name);
        body.put("unitOfMeasure", unit);
        body.put("minStock", minStock);
        return body;
    }

    @Test
    void coordenadorCriaItemComEstoqueMinimoPadraoZero() throws Exception {
        doPost("/api/items", coordinatorToken, newItem(alimentos, "  Arroz ", "KG", null))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Arroz"))
                .andExpect(jsonPath("$.categoryName").value("Alimentos"))
                .andExpect(jsonPath("$.unitOfMeasure").value("KG"))
                .andExpect(jsonPath("$.minStock").value(0))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void operadorNaoCriaMasConsulta() throws Exception {
        doPost("/api/items", operatorToken, newItem(alimentos, "Arroz", "KG", null))
                .andExpect(status().isForbidden());

        saveItem(alimentos, "Feijão", UnitOfMeasure.KG, Status.ACTIVE);
        doGet("/api/items", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    void semTokenRetorna401() throws Exception {
        doGet("/api/items", null).andExpect(status().isUnauthorized());
    }

    @Test
    void dadosInvalidosRetornam400() throws Exception {
        doPost("/api/items", coordinatorToken, newItem(alimentos, "", "KG", null)).andExpect(status().isBadRequest());
        doPost("/api/items", coordinatorToken, newItem(alimentos, "Arroz", null, null)).andExpect(status().isBadRequest());
        doPost("/api/items", coordinatorToken, newItem(alimentos, "Arroz", "KG", -1)).andExpect(status().isBadRequest());
        doPost("/api/items", coordinatorToken, newItem(alimentos, "Arroz", "KG", 1.2345)).andExpect(status().isBadRequest());
    }

    @Test
    void unidadeInteiraNaoAceitaEstoqueMinimoFracionado() throws Exception {
        doPost("/api/items", coordinatorToken, newItem(alimentos, "Cesta básica", "UNIT", 2.5))
                .andExpect(status().isUnprocessableEntity());
        doPost("/api/items", coordinatorToken, newItem(alimentos, "Cesta básica", "UNIT", 10))
                .andExpect(status().isCreated());
        doPost("/api/items", coordinatorToken, newItem(alimentos, "Arroz", "KG", 2.5))
                .andExpect(status().isCreated());
    }

    @Test
    void nomeDuplicadoSoConflitaDentroDaMesmaCategoria() throws Exception {
        saveItem(alimentos, "Sabonete", UnitOfMeasure.UNIT, Status.ACTIVE);

        doPost("/api/items", coordinatorToken, newItem(alimentos, "SABONETE", "UNIT", null))
                .andExpect(status().isConflict());
        doPost("/api/items", coordinatorToken, newItem(higiene, "Sabonete", "UNIT", null))
                .andExpect(status().isCreated());
    }

    @Test
    void categoriaInexistenteOuInativaERecusada() throws Exception {
        Category inativa = saveCategory("Antiga", false);

        doPost("/api/items", coordinatorToken, newItem(inativa, "Qualquer", "UNIT", null))
                .andExpect(status().isUnprocessableEntity());

        Map<String, Object> inexistente = newItem(alimentos, "Qualquer", "UNIT", null);
        inexistente.put("categoryId", 999999);
        doPost("/api/items", coordinatorToken, inexistente).andExpect(status().isNotFound());
    }

    @Test
    void listaComFiltrosDeBuscaCategoriaESituacao() throws Exception {
        saveItem(alimentos, "Arroz", UnitOfMeasure.KG, Status.ACTIVE);
        saveItem(alimentos, "Feijão", UnitOfMeasure.KG, Status.INACTIVE);
        saveItem(higiene, "Sabonete", UnitOfMeasure.UNIT, Status.ACTIVE);

        doGet("/api/items", operatorToken).andExpect(jsonPath("$.content.length()").value(3));

        doGet("/api/items?status=ACTIVE", operatorToken).andExpect(jsonPath("$.content.length()").value(2));
        doGet("/api/items?status=INACTIVE", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Feijão"));
        doGet("/api/items?categoryId=" + higiene.getId(), operatorToken)
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Sabonete"));
        doGet("/api/items?search=arr", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Arroz"));
    }

    @Test
    void parametrosInvalidosNaListagemRetornam400() throws Exception {
        doGet("/api/items?sort=%5B%22string%22%5D", operatorToken)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
        doGet("/api/items?sort=campoInexistente", operatorToken).andExpect(status().isBadRequest());
        doGet("/api/items?status=XYZ", operatorToken).andExpect(status().isBadRequest());
        doGet("/api/items?categoryId=abc", operatorToken).andExpect(status().isBadRequest());
    }

    @Test
    void atualizaMantendoAUnidadeEImpedindoNomeRepetido() throws Exception {
        long arroz = saveItem(alimentos, "Arroz", UnitOfMeasure.KG, Status.ACTIVE).getId();
        saveItem(alimentos, "Feijão", UnitOfMeasure.KG, Status.ACTIVE);

        Map<String, Object> update = Map.of("categoryId", higiene.getId(), "name", "Arroz integral", "minStock", 5.5);
        doPut("/api/items/" + arroz, coordinatorToken, update)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Arroz integral"))
                .andExpect(jsonPath("$.categoryName").value("Higiene"))
                .andExpect(jsonPath("$.minStock").value(5.5))
                .andExpect(jsonPath("$.unitOfMeasure").value("KG"));

        Map<String, Object> repetido = Map.of("categoryId", alimentos.getId(), "name", "feijão", "minStock", 0);
        doPut("/api/items/" + arroz, coordinatorToken, repetido).andExpect(status().isConflict());

        doPut("/api/items/" + arroz, operatorToken, update).andExpect(status().isForbidden());
        doGet("/api/items/999999", coordinatorToken).andExpect(status().isNotFound());
    }

    @Test
    void inativaEReativaItem() throws Exception {
        long arroz = saveItem(alimentos, "Arroz", UnitOfMeasure.KG, Status.ACTIVE).getId();

        doPatch("/api/items/" + arroz + "/status", coordinatorToken, Map.of("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));
        doPatch("/api/items/" + arroz + "/status", operatorToken, Map.of("status", "ACTIVE"))
                .andExpect(status().isForbidden());
        doPatch("/api/items/" + arroz + "/status", coordinatorToken, Map.of("status", "ACTIVE"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }
}
