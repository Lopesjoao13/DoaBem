package br.univille.doabem.stock.dto;

import br.univille.doabem.common.Status;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.stock.service.StockBalance;

import java.math.BigDecimal;

public record StockRowResponse(
        Long itemId,
        String name,
        Long categoryId,
        String categoryName,
        UnitOfMeasure unitOfMeasure,
        BigDecimal minStock,
        Status status,
        BigDecimal physical,
        BigDecimal reserved,
        BigDecimal available,
        StockLevel level
) {

    public static StockRowResponse from(Item item, StockBalance balance) {
        return new StockRowResponse(
                item.getId(),
                item.getName(),
                item.getCategory().getId(),
                item.getCategory().getName(),
                item.getUnitOfMeasure(),
                item.getMinStock(),
                item.getStatus(),
                balance.physical(),
                balance.reserved(),
                balance.available(),
                StockLevel.of(balance.available(), item.getMinStock()));
    }
}