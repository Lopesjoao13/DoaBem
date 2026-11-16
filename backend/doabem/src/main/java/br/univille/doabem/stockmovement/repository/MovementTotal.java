package br.univille.doabem.stockmovement.repository;

import br.univille.doabem.stockmovement.entity.MovementType;

import java.math.BigDecimal;

public interface MovementTotal {

    Long getItemId();

    MovementType getMovementType();

    MovementType getReversedType();

    BigDecimal getTotal();
}