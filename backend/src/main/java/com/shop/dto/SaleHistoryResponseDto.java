package com.shop.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SaleHistoryResponseDto(

        Long saleId,
        String saleNumber,
        LocalDateTime saleDate,
        BigDecimal totalAmount,
        Long productCount,
        Long totalQuantity

) {
}