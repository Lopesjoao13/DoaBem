package br.univille.doabem.item.entity;

import java.math.BigDecimal;

public enum UnitOfMeasure {
    UNIT("somente números inteiros", 0),
    KG("até 3 casas decimais", 3),
    L("até 3 casas decimais", 3);

    private final String quantityRule;
    private final int maxScale;

    UnitOfMeasure(String quantityRule, int maxScale) {
        this.quantityRule = quantityRule;
        this.maxScale = maxScale;
    }

    // RN10: UNIT aceita apenas inteiros; KG e L aceitam até 3 casas decimais.
    public boolean accepts(BigDecimal quantity) {
        return quantity.stripTrailingZeros().scale() <= maxScale;
    }

    public String getQuantityRule() {
        return quantityRule;
    }
}
