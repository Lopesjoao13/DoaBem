package br.univille.doabem.stock;

import br.univille.doabem.stock.dto.StockLevel;
import br.univille.doabem.stock.service.StockBalance;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static br.univille.doabem.stockmovement.entity.MovementType.ADJUSTMENT;
import static br.univille.doabem.stockmovement.entity.MovementType.DELIVERY;
import static br.univille.doabem.stockmovement.entity.MovementType.ENTRY;
import static br.univille.doabem.stockmovement.entity.MovementType.RELEASE;
import static br.univille.doabem.stockmovement.entity.MovementType.RESERVE;
import static br.univille.doabem.stockmovement.entity.MovementType.REVERSAL;
import static org.assertj.core.api.Assertions.assertThat;

class StockBalanceTests {

    private static BigDecimal n(String value) {
        return new BigDecimal(value);
    }

    // CA04: reservar sobe o reservado, baixa o disponível e não mexe no físico.
    @Test
    void reservaReduzODisponivelSemMudarOFisico() {
        StockBalance balance = StockBalance.ZERO
                .add(ENTRY, null, n("50"))
                .add(RESERVE, null, n("20"));

        assertThat(balance.physical()).isEqualByComparingTo("50");
        assertThat(balance.reserved()).isEqualByComparingTo("20");
        assertThat(balance.available()).isEqualByComparingTo("30");
    }

    // CA05: a entrega baixa o físico e consome a reserva (DELIVERY + RELEASE).
    @Test
    void entregaBaixaOFisicoEConsomeAReserva() {
        StockBalance balance = StockBalance.ZERO
                .add(ENTRY, null, n("10"))
                .add(RESERVE, null, n("4"))
                .add(DELIVERY, null, n("4"))
                .add(RELEASE, null, n("4"));

        assertThat(balance.physical()).isEqualByComparingTo("6");
        assertThat(balance.reserved()).isEqualByComparingTo("0");
        assertThat(balance.available()).isEqualByComparingTo("6");
    }

    // CA06: cancelar a separação devolve o disponível ao valor anterior.
    @Test
    void cancelamentoLiberaAReserva() {
        StockBalance balance = StockBalance.ZERO
                .add(ENTRY, null, n("50"))
                .add(RESERVE, null, n("20"))
                .add(RELEASE, null, n("20"));

        assertThat(balance.available()).isEqualByComparingTo("50");
    }

    // CA07: estornar inverte o efeito da movimentação original.
    @Test
    void estornoInverteOEfeitoDoLancamentoOriginal() {
        StockBalance adjusted = StockBalance.ZERO.add(ENTRY, null, n("10")).add(ADJUSTMENT, null, n("2"));
        assertThat(adjusted.physical()).isEqualByComparingTo("8");
        assertThat(adjusted.add(REVERSAL, ADJUSTMENT, n("2")).physical()).isEqualByComparingTo("10");

        StockBalance entry = StockBalance.ZERO.add(ENTRY, null, n("10")).add(REVERSAL, ENTRY, n("10"));
        assertThat(entry.physical()).isEqualByComparingTo("0");

        StockBalance delivery = StockBalance.ZERO.add(ENTRY, null, n("10"))
                .add(DELIVERY, null, n("3")).add(REVERSAL, DELIVERY, n("3"));
        assertThat(delivery.physical()).isEqualByComparingTo("10");
    }

    // CA11: mínimo 10, saldo 10 ou 8 é crítico.
    @Test
    void itemEhCriticoQuandoSaldoMenorOuIgualAoMinimo() {
        assertThat(StockLevel.of(n("10"), n("10"))).isEqualTo(StockLevel.CRITICAL);
        assertThat(StockLevel.of(n("8"), n("10"))).isEqualTo(StockLevel.CRITICAL);
        assertThat(StockLevel.of(n("15"), n("10"))).isEqualTo(StockLevel.LOW);
        assertThat(StockLevel.of(n("16"), n("10"))).isEqualTo(StockLevel.NORMAL);
        assertThat(StockLevel.of(n("0"), n("0"))).isEqualTo(StockLevel.CRITICAL);
    }
}