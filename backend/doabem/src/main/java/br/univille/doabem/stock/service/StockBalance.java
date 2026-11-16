package br.univille.doabem.stock.service;

import br.univille.doabem.stockmovement.entity.MovementType;

import java.math.BigDecimal;

// Saldo de um item, sempre derivado das movimentações (RN03). Não existe coluna de saldo.
public record StockBalance(BigDecimal physical, BigDecimal reserved) {

    public static final StockBalance ZERO = new StockBalance(BigDecimal.ZERO, BigDecimal.ZERO);

    // Disponível = físico - reservado (seção 5 do DER).
    public BigDecimal available() {
        return physical.subtract(reserved);
    }

    // Soma ao saldo o total de um tipo de movimentação.
    // reversedType só é usado em REVERSAL: o estorno inverte o efeito da movimentação original.
    public StockBalance add(MovementType type, MovementType reversedType, BigDecimal quantity) {
        return new StockBalance(
                physical.add(quantity.multiply(BigDecimal.valueOf(physicalSign(type, reversedType)))),
                reserved.add(quantity.multiply(BigDecimal.valueOf(reservedSign(type, reversedType)))));
    }

    private static int physicalSign(MovementType type, MovementType reversedType) {
        if (type == MovementType.REVERSAL) {
            return reversedType == null ? 0 : -physicalEffect(reversedType);
        }
        return physicalEffect(type);
    }

    private static int reservedSign(MovementType type, MovementType reversedType) {
        if (type == MovementType.REVERSAL) {
            return reversedType == null ? 0 : -reservedEffect(reversedType);
        }
        return reservedEffect(type);
    }

    private static int physicalEffect(MovementType type) {
        return switch (type) {
            case ENTRY -> 1;
            case DELIVERY, ADJUSTMENT -> -1;
            default -> 0;
        };
    }

    private static int reservedEffect(MovementType type) {
        return switch (type) {
            case RESERVE -> 1;
            case RELEASE -> -1;
            default -> 0;
        };
    }
}