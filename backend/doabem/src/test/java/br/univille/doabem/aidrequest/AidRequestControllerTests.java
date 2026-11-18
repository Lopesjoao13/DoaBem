package br.univille.doabem.aidrequest;

import br.univille.doabem.aidrequest.repository.AidRequestRepository;
import br.univille.doabem.common.Status;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.stockmovement.entity.MovementType;
import br.univille.doabem.stockmovement.repository.StockMovementRepository;
import br.univille.doabem.support.FlowTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasKey;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AidRequestControllerTests extends FlowTestSupport {

    @Autowired
    private StockMovementRepository movementRepository;
    @Autowired
    private AidRequestRepository requestRepository;

    private void assertStock(Item item, double physical, double reserved, double available) throws Exception {
        doGet("/api/stock", coordinatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.itemId==" + item.getId() + ")].physical").value(physical))
                .andExpect(jsonPath("$[?(@.itemId==" + item.getId() + ")].reserved").value(reserved))
                .andExpect(jsonPath("$[?(@.itemId==" + item.getId() + ")].available").value(available));
    }

    private long countMovements(MovementType type) {
        return movementRepository.findAll().stream().filter(m -> m.getType() == type).count();
    }

    private void decide(long id, Object body, int expectedStatus) throws Exception {
        doPost("/api/requests/" + id + "/decision", coordinatorToken, body).andExpect(status().is(expectedStatus));
    }

    // ----------------------------------------------------------------- criação

    @Test
    void operadorCriaSolicitacaoPendenteSemMexerNoEstoque() throws Exception {
        receive(arroz, 50);

        long id = createRequest(familia, requestLine(arroz, 10), requestLine(sabonete, 4));

        doGet("/api/requests/" + id, operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.requestedBy").value("Oper"))
                .andExpect(jsonPath("$.beneficiary.responsibleName").value("Maria Souza"))
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].itemName").value("Arroz"))
                .andExpect(jsonPath("$.items[0].requestedQty").value(10))
                .andExpect(jsonPath("$.items[0].approvedQty").doesNotExist())
                .andExpect(jsonPath("$.items[0].available").value(50))
                .andExpect(jsonPath("$.delivery").doesNotExist());
        assertStock(arroz, 50, 0, 50);
        assertThat(movementRepository.count()).isEqualTo(1);
    }

    @Test
    void criacaoComFamiliaInativaItemInativoDuplicadoOuQuantidadeInvalidaRetorna400ComFieldErrors() throws Exception {
        Item inativo = saveItem(arroz.getCategory(), "Feijão", UnitOfMeasure.KG, Status.INACTIVE);
        var inativa = saveBeneficiary("Inativa", Status.INACTIVE);

        doPost("/api/requests", operatorToken,
                Map.of("beneficiaryId", inativa.getId(), "lines", List.of(requestLine(arroz, 1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.beneficiaryId").exists());

        doPost("/api/requests", operatorToken, Map.of("beneficiaryId", familia.getId(),
                "lines", List.of(requestLine(inativo, 1), requestLine(arroz, 1), requestLine(arroz, 2),
                        requestLine(sabonete, 2.5))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors", hasKey("lines[0].itemId")))
                .andExpect(jsonPath("$.fieldErrors", hasKey("lines[2].itemId")))
                .andExpect(jsonPath("$.fieldErrors", hasKey("lines[3].requestedQty")));

        assertThat(requestRepository.count()).isZero();
    }

    @Test
    void criacaoSemLinhasOuComQuantidadeNaoPositivaRetorna400() throws Exception {
        doPost("/api/requests", operatorToken, Map.of("beneficiaryId", familia.getId(), "lines", List.of()))
                .andExpect(status().isBadRequest());
        doPost("/api/requests", operatorToken,
                Map.of("beneficiaryId", familia.getId(), "lines", List.of(requestLine(arroz, 0))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors", hasKey("lines[0].requestedQty")));
    }

    @Test
    void familiaOuItemInexistenteRetorna404() throws Exception {
        doPost("/api/requests", operatorToken,
                Map.of("beneficiaryId", 999999, "lines", List.of(requestLine(arroz, 1))))
                .andExpect(status().isNotFound());
        doPost("/api/requests", operatorToken, Map.of("beneficiaryId", familia.getId(),
                "lines", List.of(Map.of("itemId", 999999, "requestedQty", 1))))
                .andExpect(status().isNotFound());
    }

    @Test
    void semTokenRetorna401() throws Exception {
        doGet("/api/requests", null).andExpect(status().isUnauthorized());
    }

    // ----------------------------------------------------------------- análise (CA02, CA08)

    @Test
    void operadorNaoAnalisaSolicitacao() throws Exception {
        long id = createRequest(familia, requestLine(arroz, 10));

        doPost("/api/requests/" + id + "/decision", operatorToken,
                Map.of("decision", "REJECT", "justification", "x")).andExpect(status().isForbidden());
    }

    // CA02: aprovação parcial exige justificativa; aprovado não excede o solicitado; saldo não muda.
    @Test
    void aprovacaoParcialExigeJustificativaENaoExcedeOSolicitado() throws Exception {
        receive(arroz, 50);
        long id = createRequest(familia, requestLine(arroz, 10));
        long lineId = objectMapper.readTree(doGet("/api/requests/" + id, coordinatorToken)
                .andReturn().getResponse().getContentAsString()).get("items").get(0).get("id").asLong();

        doPost("/api/requests/" + id + "/decision", coordinatorToken,
                Map.of("decision", "APPROVE", "items", List.of(Map.of("id", lineId, "approvedQty", 6))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.justification").exists());

        doPost("/api/requests/" + id + "/decision", coordinatorToken,
                Map.of("decision", "APPROVE", "items", List.of(Map.of("id", lineId, "approvedQty", 11)),
                        "justification", "x"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors", hasKey("approved." + lineId)));

        doPost("/api/requests/" + id + "/decision", coordinatorToken,
                Map.of("decision", "APPROVE", "items", List.of(Map.of("id", lineId, "approvedQty", 6)),
                        "justification", "Estoque curto"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        doGet("/api/requests/" + id, operatorToken)
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.items[0].approvedQty").value(6))
                .andExpect(jsonPath("$.decidedBy").value("Coord"))
                .andExpect(jsonPath("$.justification").value("Estoque curto"));
        assertStock(arroz, 50, 0, 50);
    }

    @Test
    void aprovacaoSemInformarTodasAsLinhasOuComLinhaAlheiaEhRecusada() throws Exception {
        long id = createRequest(familia, requestLine(arroz, 10), requestLine(sabonete, 2));
        long other = createRequest(familia, requestLine(arroz, 1));
        long otherLine = objectMapper.readTree(doGet("/api/requests/" + other, coordinatorToken)
                .andReturn().getResponse().getContentAsString()).get("items").get(0).get("id").asLong();

        decide(id, Map.of("decision", "APPROVE", "items", List.of()), 400);
        decide(id, Map.of("decision", "APPROVE", "items", List.of(Map.of("id", otherLine, "approvedQty", 1))), 400);
        decide(id, Map.of("decision", "APPROVE"), 400);
    }

    @Test
    void quantidadeAprovadaRespeitaAUnidadeDoItem() throws Exception {
        long id = createRequest(familia, requestLine(sabonete, 5));
        long lineId = objectMapper.readTree(doGet("/api/requests/" + id, coordinatorToken)
                .andReturn().getResponse().getContentAsString()).get("items").get(0).get("id").asLong();

        doPost("/api/requests/" + id + "/decision", coordinatorToken,
                Map.of("decision", "APPROVE", "items", List.of(Map.of("id", lineId, "approvedQty", 2.5)),
                        "justification", "x"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors", hasKey("approved." + lineId)));
    }

    @Test
    void recusaExigeJustificativaEZeraAsQuantidades() throws Exception {
        long id = createRequest(familia, requestLine(arroz, 10));

        decide(id, Map.of("decision", "REJECT"), 400);
        decide(id, Map.of("decision", "REJECT", "justification", "  "), 400);
        doPost("/api/requests/" + id + "/decision", coordinatorToken,
                Map.of("decision", "REJECT", "justification", "Fora do perfil"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        doGet("/api/requests/" + id, operatorToken)
                .andExpect(jsonPath("$.items[0].approvedQty").value(0));
    }

    // D-06: aprovar tudo com zero equivale a recusa.
    @Test
    void aprovacaoComTodasAsQuantidadesZeradasViraRecusa() throws Exception {
        long id = createRequest(familia, requestLine(arroz, 10));

        approveAll(id, 0);

        doGet("/api/requests/" + id, operatorToken).andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    void soSolicitacaoPendentePodeSerAnalisada() throws Exception {
        long id = createRequest(familia, requestLine(arroz, 10));
        approveAll(id);

        decide(id, Map.of("decision", "REJECT", "justification", "x"), 409);
    }

    @Test
    void decisaoInvalidaOuCorpoMalformadoRetorna400() throws Exception {
        long id = createRequest(familia, requestLine(arroz, 10));

        decide(id, Map.of("decision", "TALVEZ"), 400);
        decide(id, Map.of(), 400);
    }

    // ----------------------------------------------------------------- separação (CA03, CA04)

    // CA03: separar acima do saldo é bloqueado e nada é reservado.
    @Test
    void separacaoAcimaDoDisponivelEhBloqueadaSemReservarNada() throws Exception {
        receive(arroz, 20);
        receive(sabonete, 100);
        long id = createRequest(familia, requestLine(sabonete, 10), requestLine(arroz, 30));
        approveAll(id);

        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of())
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Saldo insuficiente")))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Arroz")));

        assertThat(countMovements(MovementType.RESERVE)).isZero();
        assertStock(arroz, 20, 0, 20);
        assertStock(sabonete, 100, 0, 100);
        doGet("/api/requests/" + id, operatorToken).andExpect(jsonPath("$.status").value("APPROVED"));
    }

    // CA04: separar reserva; físico não muda, disponível cai.
    @Test
    void separacaoReservaSemMudarOFisico() throws Exception {
        receive(arroz, 50);
        long id = createRequest(familia, requestLine(arroz, 20));
        approveAll(id);

        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PICKED"));

        assertStock(arroz, 50, 20, 30);
        doGet("/api/requests/" + id, operatorToken)
                .andExpect(jsonPath("$.status").value("PICKED"))
                .andExpect(jsonPath("$.pickedBy").value("Oper"))
                .andExpect(jsonPath("$.items[0].available").value(30));
    }

    @Test
    void duasSeparacoesNaoReservamMaisQueODisponivel() throws Exception {
        receive(arroz, 50);
        long first = createRequest(familia, requestLine(arroz, 30));
        long second = createRequest(familia, requestLine(arroz, 30));
        approveAll(first);
        approveAll(second);

        doPost("/api/requests/" + first + "/pick", operatorToken, Map.of()).andExpect(status().isOk());
        doPost("/api/requests/" + second + "/pick", operatorToken, Map.of()).andExpect(status().isUnprocessableEntity());

        assertStock(arroz, 50, 30, 20);
    }

    @Test
    void itemQueFicouInativoBloqueiaASeparacao() throws Exception {
        receive(arroz, 50);
        long id = createRequest(familia, requestLine(arroz, 10));
        approveAll(id);
        arroz.setStatus(Status.INACTIVE);
        itemRepository.save(arroz);

        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of())
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("inativo")));
        assertThat(countMovements(MovementType.RESERVE)).isZero();
    }

    @Test
    void soSolicitacaoAprovadaPodeSerSeparada() throws Exception {
        long id = createRequest(familia, requestLine(arroz, 10));

        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of()).andExpect(status().isConflict());
    }

    @Test
    void itemAprovadoComZeroNaoEhReservado() throws Exception {
        receive(arroz, 50);
        receive(sabonete, 10);
        long id = createRequest(familia, requestLine(arroz, 10), requestLine(sabonete, 4));
        approveAll(id, 10, 0);

        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of()).andExpect(status().isOk());

        assertThat(countMovements(MovementType.RESERVE)).isEqualTo(1);
        assertStock(sabonete, 10, 0, 10);
    }

    // ----------------------------------------------------------------- entrega (CA05)

    @Test
    void entregaConsomeAReservaEBaixaOFisico() throws Exception {
        receive(arroz, 50);
        long id = createRequest(familia, requestLine(arroz, 20));
        approveAll(id);
        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of()).andExpect(status().isOk());

        doPost("/api/requests/" + id + "/deliver", operatorToken, Map.of("notes", "Retirou no balcão"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELIVERED"));

        assertStock(arroz, 30, 0, 30);
        assertThat(countMovements(MovementType.DELIVERY)).isEqualTo(1);
        assertThat(countMovements(MovementType.RELEASE)).isEqualTo(1);
        doGet("/api/requests/" + id, operatorToken)
                .andExpect(jsonPath("$.status").value("DELIVERED"))
                .andExpect(jsonPath("$.delivery.deliveredBy").value("Oper"))
                .andExpect(jsonPath("$.delivery.notes").value("Retirou no balcão"));
    }

    @Test
    void entregaAceitaCorpoVazio() throws Exception {
        receive(arroz, 50);
        long id = createRequest(familia, requestLine(arroz, 20));
        approveAll(id);
        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of()).andExpect(status().isOk());

        doPost("/api/requests/" + id + "/deliver", operatorToken, Map.of()).andExpect(status().isOk());
    }

    @Test
    void soSolicitacaoSeparadaPodeSerEntregueEUmaVezSo() throws Exception {
        receive(arroz, 50);
        long id = createRequest(familia, requestLine(arroz, 20));
        approveAll(id);

        doPost("/api/requests/" + id + "/deliver", operatorToken, Map.of()).andExpect(status().isConflict());

        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of()).andExpect(status().isOk());
        doPost("/api/requests/" + id + "/deliver", operatorToken, Map.of()).andExpect(status().isOk());
        doPost("/api/requests/" + id + "/deliver", operatorToken, Map.of()).andExpect(status().isConflict());

        assertStock(arroz, 30, 0, 30);
    }

    // ----------------------------------------------------------------- cancelamento (CA06)

    @Test
    void cancelarSeparadaLiberaAsReservasEOperadorPodeFazerIsso() throws Exception {
        receive(arroz, 50);
        long id = createRequest(familia, requestLine(arroz, 20));
        approveAll(id);
        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of()).andExpect(status().isOk());
        assertStock(arroz, 50, 20, 30);

        doPost("/api/requests/" + id + "/cancel", operatorToken, Map.of("reason", "Família desistiu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        assertStock(arroz, 50, 0, 50);
        doGet("/api/requests/" + id, operatorToken)
                .andExpect(jsonPath("$.cancelledBy").value("Oper"))
                .andExpect(jsonPath("$.cancellationReason").value("Família desistiu"));
    }

    // D-04: PENDENTE e APROVADA só o Coordenador cancela.
    @Test
    void operadorNaoCancelaPendenteNemAprovada() throws Exception {
        long pending = createRequest(familia, requestLine(arroz, 10));
        long approved = createRequest(familia, requestLine(arroz, 10));
        approveAll(approved);

        doPost("/api/requests/" + pending + "/cancel", operatorToken, Map.of("reason", "x")).andExpect(status().isForbidden());
        doPost("/api/requests/" + approved + "/cancel", operatorToken, Map.of("reason", "x")).andExpect(status().isForbidden());

        doPost("/api/requests/" + pending + "/cancel", coordinatorToken, Map.of("reason", "x")).andExpect(status().isOk());
        doPost("/api/requests/" + approved + "/cancel", coordinatorToken, Map.of("reason", "x")).andExpect(status().isOk());
    }

    @Test
    void cancelamentoExigeMotivo() throws Exception {
        long id = createRequest(familia, requestLine(arroz, 10));

        doPost("/api/requests/" + id + "/cancel", coordinatorToken, Map.of())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors", hasKey("reason")));
        doPost("/api/requests/" + id + "/cancel", coordinatorToken, Map.of("reason", "  "))
                .andExpect(status().isBadRequest());
    }

    @Test
    void naoCancelaAposEntregaRecusaOuCancelamento() throws Exception {
        receive(arroz, 50);
        long delivered = createRequest(familia, requestLine(arroz, 10));
        approveAll(delivered);
        doPost("/api/requests/" + delivered + "/pick", operatorToken, Map.of());
        doPost("/api/requests/" + delivered + "/deliver", operatorToken, Map.of());
        long cancelled = createRequest(familia, requestLine(arroz, 10));
        doPost("/api/requests/" + cancelled + "/cancel", coordinatorToken, Map.of("reason", "x"));

        doPost("/api/requests/" + delivered + "/cancel", coordinatorToken, Map.of("reason", "x")).andExpect(status().isConflict());
        doPost("/api/requests/" + cancelled + "/cancel", coordinatorToken, Map.of("reason", "x")).andExpect(status().isConflict());
        assertStock(arroz, 40, 0, 40);
    }

    // ----------------------------------------------------------------- consultas

    @Test
    void listagemFiltraPorEstadoEInformaContagemPorEstado() throws Exception {
        long a = createRequest(familia, requestLine(arroz, 1));
        long b = createRequest(familia, requestLine(arroz, 1), requestLine(sabonete, 1));
        approveAll(b);

        doGet("/api/requests", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.counts.ALL").value(2))
                .andExpect(jsonPath("$.counts.PENDING").value(1))
                .andExpect(jsonPath("$.counts.APPROVED").value(1))
                .andExpect(jsonPath("$.counts.DELIVERED").value(0))
                .andExpect(jsonPath("$.page.totalElements").value(2));

        doGet("/api/requests?status=APPROVED", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(b))
                .andExpect(jsonPath("$.content[0].itemCount").value(2))
                .andExpect(jsonPath("$.content[0].beneficiaryName").value("Maria Souza"))
                .andExpect(jsonPath("$.content[0].requestedBy").value("Oper"))
                // as abas continuam mostrando todos os estados
                .andExpect(jsonPath("$.counts.PENDING").value(1));

        doGet("/api/requests?status=PENDING", operatorToken)
                .andExpect(jsonPath("$.content[0].id").value(a));
    }

    @Test
    void listagemFiltraPorBuscaPeriodoESolicitante() throws Exception {
        var outra = saveBeneficiary("João Pereira", Status.ACTIVE);
        long maria = createRequest(familia, requestLine(arroz, 1));
        long joao = createRequest(outra, requestLine(arroz, 1));

        doGet("/api/requests?search=joão", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(joao));
        // O id aparece na tela como "#12": a busca aceita com e sem o "#".
        mockMvc.perform(get("/api/requests").param("search", "#" + maria)
                        .header("Authorization", "Bearer " + operatorToken))
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(maria));
        doGet("/api/requests?from=2999-01-01", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(0))
                .andExpect(jsonPath("$.counts.ALL").value(0));
        doGet("/api/requests?to=2000-01-01", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(0));
        doGet("/api/requests?from=2000-01-01&to=2999-12-31", operatorToken)
                .andExpect(jsonPath("$.content.length()").value(2));
        doGet("/api/requests?requestedById=" + userRepository.findByEmail("coord@test.local").orElseThrow().getId(),
                operatorToken)
                .andExpect(jsonPath("$.content.length()").value(0));
    }

    @Test
    void parametrosInvalidosNaListagemRetornam400() throws Exception {
        doGet("/api/requests?status=XYZ", operatorToken).andExpect(status().isBadRequest());
        doGet("/api/requests?from=ontem", operatorToken).andExpect(status().isBadRequest());
        doGet("/api/requests?sort=naoExiste", operatorToken).andExpect(status().isBadRequest());
    }

    @Test
    void solicitacaoInexistenteRetorna404() throws Exception {
        doGet("/api/requests/999999", operatorToken).andExpect(status().isNotFound());
        doPost("/api/requests/999999/pick", operatorToken, Map.of()).andExpect(status().isNotFound());
    }

    // ----------------------------------------------------------------- famílias (RF24, RF25)

    @Test
    void resumoDeEntregasETemHistoricoDaFamilia() throws Exception {
        receive(arroz, 50);
        long first = createRequest(familia, requestLine(arroz, 10));
        approveAll(first);
        doPost("/api/requests/" + first + "/pick", operatorToken, Map.of());
        doPost("/api/requests/" + first + "/deliver", operatorToken, Map.of());
        long second = createRequest(familia, requestLine(arroz, 5));

        doGet("/api/beneficiaries/" + familia.getId() + "/delivery-summary", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastDelivery.requestId").value(first))
                .andExpect(jsonPath("$.lastDelivery.deliveredBy").value("Oper"))
                .andExpect(jsonPath("$.lastDelivery.items[0].itemName").value("Arroz"))
                .andExpect(jsonPath("$.lastDelivery.items[0].quantity").value(10))
                .andExpect(jsonPath("$.recentDeliveries.length()").value(1));

        doGet("/api/beneficiaries/" + familia.getId() + "/requests", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requests.length()").value(2))
                .andExpect(jsonPath("$.requests[0].id").value(second))
                .andExpect(jsonPath("$.requests[1].status").value("DELIVERED"))
                .andExpect(jsonPath("$.deliveries.length()").value(1));

        // No detalhe de outra solicitação da mesma família, a última entrega aparece como apoio à decisão.
        doGet("/api/requests/" + second, operatorToken)
                .andExpect(jsonPath("$.familyHistory.lastDelivery.requestId").value(first));
        // O histórico é o da família (mesmo resumo de /delivery-summary), inclusive na solicitação já entregue.
        doGet("/api/requests/" + first, operatorToken)
                .andExpect(jsonPath("$.familyHistory.lastDelivery.requestId").value(first))
                .andExpect(jsonPath("$.delivery.deliveredBy").value("Oper"));
    }

    @Test
    void familiaSemEntregasRetornaResumoVazioEInexistenteRetorna404() throws Exception {
        doGet("/api/beneficiaries/" + familia.getId() + "/delivery-summary", operatorToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastDelivery").doesNotExist())
                .andExpect(jsonPath("$.recentDeliveries.length()").value(0));
        doGet("/api/beneficiaries/" + familia.getId() + "/requests", operatorToken)
                .andExpect(jsonPath("$.requests.length()").value(0))
                .andExpect(jsonPath("$.deliveries.length()").value(0));

        doGet("/api/beneficiaries/999999/delivery-summary", operatorToken).andExpect(status().isNotFound());
        doGet("/api/beneficiaries/999999/requests", operatorToken).andExpect(status().isNotFound());
    }

    // ----------------------------------------------------------------- inativação de item (RN14)

    @Test
    void itemComReservaAtivaNaoPodeSerInativado() throws Exception {
        receive(arroz, 50);
        long id = createRequest(familia, requestLine(arroz, 20));
        approveAll(id);
        doPost("/api/requests/" + id + "/pick", operatorToken, Map.of()).andExpect(status().isOk());

        doPatch("/api/items/" + arroz.getId() + "/status", coordinatorToken, Map.of("status", "INACTIVE"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("reservada")));
        doGet("/api/items/" + arroz.getId(), coordinatorToken)
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    // D-07 (decisão do PO em 17/11/2026): item com saldo em estoque não pode ser inativado.
    @Test
    void itemComSaldoNaoPodeSerInativado() throws Exception {
        receive(arroz, 50);
        long id = createRequest(familia, requestLine(arroz, 20));
        approveAll(id);

        doPatch("/api/items/" + arroz.getId() + "/status", coordinatorToken, Map.of("status", "INACTIVE"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("saldo em estoque")));
        doGet("/api/items/" + arroz.getId(), coordinatorToken)
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void itemSemSaldoPodeSerInativado() throws Exception {
        doPatch("/api/items/" + arroz.getId() + "/status", coordinatorToken, Map.of("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }

    @Test
    void itemPodeSerInativadoDepoisDeZerarOSaldoPorAjuste() throws Exception {
        receive(arroz, 50);
        doPatch("/api/items/" + arroz.getId() + "/status", coordinatorToken, Map.of("status", "INACTIVE"))
                .andExpect(status().isConflict());

        doPost("/api/stock/adjustments", coordinatorToken,
                Map.of("itemId", arroz.getId(), "quantity", 50, "adjustmentReason", "LOSS", "notes", "Zerando para inativar"))
                .andExpect(status().isCreated());

        doPatch("/api/items/" + arroz.getId() + "/status", coordinatorToken, Map.of("status", "INACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }
}
