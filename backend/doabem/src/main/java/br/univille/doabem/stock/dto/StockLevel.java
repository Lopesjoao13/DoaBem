package br.univille.doabem.stock.dto;

import java.math.BigDecimal;

public enum StockLevel {
    CRITICAL,
    LOW,
    NORMAL;

    private static final BigDecimal LOW_FACTOR = new BigDecimal("1.5");

    // RN11: crítico quando saldo <= mínimo (D-01: usa o disponível). "Baixo" é até 1,5x o mínimo.
    public static StockLevel of(BigDecimal available, BigDecimal minStock) {
        if (available.compareTo(minStock) <= 0) {
            return CRITICAL;
        }
        if (available.compareTo(minStock.multiply(LOW_FACTOR)) <= 0) {
            return LOW;
        }
        return NORMAL;
    }
}