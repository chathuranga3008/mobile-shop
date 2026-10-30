package com.shop.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ItemResponseDto(
        Long id,
        String sku,
        String name,
        String brand,
        String category,
        BigDecimal price,
        Integer quantity,
        Integer lowStockThreshold,
        LocalDateTime createdAt
) {
}
