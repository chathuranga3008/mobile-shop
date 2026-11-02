package com.shop.dto;

import java.math.BigDecimal;

public record TopSellingProductResponseDto(
        Long itemId,
        String sku,
        String itemName,
        Long totalQuantitySold,
        BigDecimal totalRevenue
) {
}
