package com.shop.dto;

import java.math.BigDecimal;

public record ItemRequestDto(
        String sku,
        String name,
        String brand,
        String category,
        BigDecimal price,
        Integer quantity,
        Integer lowStockThreshold
) {
}