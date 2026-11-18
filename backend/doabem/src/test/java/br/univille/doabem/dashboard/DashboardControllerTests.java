package br.univille.doabem.dashboard;

import br.univille.doabem.common.Status;
import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.support.FlowTestSupport;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Map;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DashboardControllerTests extends FlowTestSupport {

    @Test
    void semDadosRetornaIndicadoresZeradosEListasVazias() throws Exception {
        doGet("/api/dashboard", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeItems").value(2))
                .andExpect(jsonPath("$.activeCategories").value(1))
                .andExpect(jsonPath("$.entriesInPeriod").value(0))
                .andExpect(jsonPath("$.deliveriesInPeriod").value(0))
                .andExpect(jsonPath("$.pendingRequests").value(0))
                .andExpect(jsonPath("$.recentMovements.length()").value(0))
                .andExpect(jsonPath("$.pendingList.length()").value(0))
                .andExpect(jsonPath("$.generatedAt").exists());
    }

    // CA09: os números do dashboard batem com o estoque e com o histórico.
    @Test
    void indicadoresBatemComEstoqueEHistorico() throws Exception {
        arroz.setMinStock(new BigDecimal("10"));
        itemRepository.save(arroz);
        receive(arroz, 50);
        receive(sabonete, 8);
        long delivered = createRequest(familia, requestLine(arroz, 45));
        approveAll(delivered);
        doPost("/api/requests/" + delivered + "/pick", operatorToken, Map.of());
        doPost("/api/requests/" + delivered + "/deliver", operatorToken, Map.of());
        long pending = createRequest(familia, requestLine(sabonete, 2), requestLine(arroz, 1));

        doGet("/api/dashboard", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeItems").value(2))
                .andExpect(jsonPath("$.entriesInPeriod").value(2))
                .andExpect(jsonPath("$.deliveriesInPeriod").value(1))
                .andExpect(jsonPath("$.pendingRequests").value(1))
                // Arroz: 50 - 45 = 5 <= mínimo 10 -> crítico; Sabonete (mínimo 0, saldo 8) não.
                .andExpect(jsonPath("$.criticalItems").value(1))
                .andExpect(jsonPath("$.topCritical.length()").value(1))
                .andExpect(jsonPath("$.topCritical[0].name").value("Arroz"))
                .andExpect(jsonPath("$.topCritical[0].available").value(5))
                .andExpect(jsonPath("$.topCritical[0].minStock").value(10))
                .andExpect(jsonPath("$.topCritical[0].level").value("CRITICAL"))
                .andExpect(jsonPath("$.pendingList.length()").value(1))
                .andExpect(jsonPath("$.pendingList[0].id").value(pending))
                .andExpect(jsonPath("$.pendingList[0].beneficiaryName").value("Maria Souza"))
                .andExpect(jsonPath("$.pendingList[0].itemCount").value(2))
                .andExpect(jsonPath("$.recentMovements.length()").value(3))
                .andExpect(jsonPath("$.recentMovements[0].type").value("DELIVERY"))
                .andExpect(jsonPath("$.balanceByCategory.length()").value(1))
                .andExpect(jsonPath("$.balanceByCategory[0].categoryName").value("Geral"))
                .andExpect(jsonPath("$.balanceByCategory[0].available").value(13));
    }

    @Test
    void periodoFiltraSomenteEntradasEEntregasEEstoqueRefleteOMomentoAtual() throws Exception {
        receive(arroz, 50);
        long id = createRequest(familia, requestLine(arroz, 10));
        approveAll(id);
        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of());
        doPost("/api/requests/" + id + "/deliver", operatorToken, Map.of());
        createRequest(familia, requestLine(arroz, 1));

        doGet("/api/dashboard?from=2000-01-01&to=2000-01-31", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entriesInPeriod").value(0))
                .andExpect(jsonPath("$.deliveriesInPeriod").value(0))
                // Não dependem do período:
                .andExpect(jsonPath("$.pendingRequests").value(1))
                .andExpect(jsonPath("$.activeItems").value(2))
                .andExpect(jsonPath("$.balanceByCategory[0].available").value(40));
    }

    @Test
    void periodoAnteriorTemOMesmoNumeroDeDias() throws Exception {
        receive(arroz, 50);
        LocalDate today = LocalDate.now();

        // Período de 1 dia (hoje): o anterior é ontem, sem movimento.
        doGet("/api/dashboard?from=" + today + "&to=" + today, operatorToken)
                .andExpect(jsonPath("$.entriesInPeriod").value(1))
                .andExpect(jsonPath("$.previous.entries").value(0))
                .andExpect(jsonPath("$.previous.deliveries").value(0));
        // Período de 2 dias (ontem e hoje): o anterior não inclui hoje.
        doGet("/api/dashboard?from=" + today.minusDays(1) + "&to=" + today, operatorToken)
                .andExpect(jsonPath("$.entriesInPeriod").value(1))
                .andExpect(jsonPath("$.previous.entries").value(0));
        // Período de ontem: o anterior é anteontem; hoje não conta em nenhum.
        doGet("/api/dashboard?from=" + today.minusDays(1) + "&to=" + today.minusDays(1), operatorToken)
                .andExpect(jsonPath("$.entriesInPeriod").value(0));
    }

    @Test
    void serieMensalTemDeTresADozeMesesTerminandoNoFimDoPeriodo() throws Exception {
        receive(arroz, 50);
        String thisMonth = YearMonth.now().toString();

        doGet("/api/dashboard", operatorToken)
                .andExpect(jsonPath("$.monthly.length()").value(3))
                .andExpect(jsonPath("$.monthly[2].month").value(thisMonth))
                .andExpect(jsonPath("$.monthly[2].entries").value(1))
                .andExpect(jsonPath("$.monthly[2].deliveries").value(0))
                .andExpect(jsonPath("$.monthly[0].entries").value(0));
        doGet("/api/dashboard?from=2020-01-01&to=" + LocalDate.now(), operatorToken)
                .andExpect(jsonPath("$.monthly.length()").value(12));
    }

    @Test
    void itensInativosECategoriasInativasFicamForaDosIndicadores() throws Exception {
        saveItem(arroz.getCategory(), "Feijão", UnitOfMeasure.KG, Status.INACTIVE);
        saveCategory("Antiga", false);

        doGet("/api/dashboard", operatorToken)
                .andExpect(jsonPath("$.activeItems").value(2))
                .andExpect(jsonPath("$.activeCategories").value(1))
                .andExpect(jsonPath("$.balanceByCategory.length()").value(1));
    }

    @Test
    void topCriticalFicaLimitadoACincoOrdenadoDoMaisCritico() throws Exception {
        // Com mínimo 0, só sai de "crítico" quem tem saldo: arroz e sabonete ficam de fora da lista.
        receive(arroz, 1);
        receive(sabonete, 1);
        for (int index = 1; index <= 6; index++) {
            var item = saveItem(arroz.getCategory(), "Item " + index, UnitOfMeasure.UNIT, Status.ACTIVE);
            item.setMinStock(new BigDecimal("100"));
            itemRepository.save(item);
            receive(item, index * 10);
        }

        doGet("/api/dashboard", operatorToken)
                .andExpect(jsonPath("$.topCritical.length()").value(5))
                .andExpect(jsonPath("$.topCritical[0].name").value("Item 1"))
                .andExpect(jsonPath("$.topCritical[4].name").value("Item 5"));
    }

    @Test
    void periodoInvertidoOuMalformadoRetorna400() throws Exception {
        doGet("/api/dashboard?from=2026-02-01&to=2026-01-01", operatorToken)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.from").exists());
        doGet("/api/dashboard?from=ontem", operatorToken).andExpect(status().isBadRequest());
    }

    @Test
    void semTokenRetorna401() throws Exception {
        doGet("/api/dashboard", null).andExpect(status().isUnauthorized());
    }
}
