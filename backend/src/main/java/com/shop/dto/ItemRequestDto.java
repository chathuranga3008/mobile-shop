package com.shop.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ItemRequestDto(

        @NotBlank
        String sku,

        @NotBlank
        String name,

        @NotBlank
        String brand,

        @NotBlank
        String category,

        @NotNull
        @DecimalMin("0.00")
        BigDecimal price,

        @NotNull
        @Min(0)
        Integer quantity,

        @NotNull
        @Min(0)
        Integer lowStockThreshold

) {
}
