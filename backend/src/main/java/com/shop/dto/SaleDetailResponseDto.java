package com.shop.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SaleDetailResponseDto(
        Long saleId,
        String saleNumber,
        LocalDateTime saleDate,
        BigDecimal totalAmount,
        Long saleItemId,
        Long itemId,
        String sku,
        String itemName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
}