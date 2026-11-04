package br.univille.doabem.item.dto;

import br.univille.doabem.common.Status;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.entity.UnitOfMeasure;

import java.math.BigDecimal;

public record ItemResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String name,
        UnitOfMeasure unitOfMeasure,
        BigDecimal minStock,
        Status status
) {

    public static ItemResponse from(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getCategory().getId(),
                item.getCategory().getName(),
                item.getName(),
                item.getUnitOfMeasure(),
                item.getMinStock(),
                item.getStatus());
    }
}
