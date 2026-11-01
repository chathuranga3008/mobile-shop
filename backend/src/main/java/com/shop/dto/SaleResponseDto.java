package com.shop.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SaleResponseDto(

        Long saleId,
        String saleNumber,
        LocalDateTime saleDate,
        BigDecimal totalAmount

) {
}