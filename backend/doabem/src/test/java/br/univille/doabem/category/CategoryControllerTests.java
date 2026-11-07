package br.univille.doabem.category;

import br.univille.doabem.support.ApiTestSupport;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CategoryControllerTests extends ApiTestSupport {

    @Test
    void coordenadorCriaCategoria() throws Exception {
        doPost("/api/categories", coordinatorToken, Map.of("name", "  Alimentos ", "description", "Não perecíveis"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Alimentos"))
                .andExpect(jsonPath("$.description").value("Não perecíveis"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void operadorNaoCriaMasConsulta() throws Exception {
        doPost("/api/categories", operatorToken, Map.of("name", "Higiene")).andExpect(status().isForbidden());

        saveCategory("Higiene", true);
        doGet("/api/categories", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    void semTokenRetorna401() throws Exception {
        doGet("/api/categories", null).andExpect(status().isUnauthorized());
    }

    @Test
    void nomeVazioRetorna400() throws Exception {
        doPost("/api/categories", coordinatorToken, Map.of("name", " ")).andExpect(status().isBadRequest());
    }

    @Test
    void nomeDuplicadoIgnorandoMaiusculasRetorna409() throws Exception {
        saveCategory("Alimentos", true);

        doPost("/api/categories", coordinatorToken, Map.of("name", "ALIMENTOS")).andExpect(status().isConflict());
    }

    @Test
    void atualizaEImpedeNomeDeOutraCategoria() throws Exception {
        long alimentos = saveCategory("Alimentos", true).getId();
        saveCategory("Roupas", true);

        doPut("/api/categories/" + alimentos, coordinatorToken, Map.of("name", "Alimentos básicos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alimentos básicos"));

        doPut("/api/categories/" + alimentos, coordinatorToken, Map.of("name", "roupas"))
                .andExpect(status().isConflict());

        doPut("/api/categories/999999", coordinatorToken, Map.of("name", "Qualquer"))
                .andExpect(status().isNotFound());
    }

    @Test
    void inativaEFiltraPorSituacao() throws Exception {
        long alimentos = saveCategory("Alimentos", true).getId();
        saveCategory("Roupas", true);

        doPatch("/api/categories/" + alimentos + "/status", coordinatorToken, Map.of("active", false))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        doPatch("/api/categories/" + alimentos + "/status", operatorToken, Map.of("active", true))
                .andExpect(status().isForbidden());

        doGet("/api/categories?active=false", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Alimentos"));
        doGet("/api/categories?active=true", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Roupas"));
    }
}
