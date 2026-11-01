package com.shop.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SaleItemRequestDto(

        @NotNull
        @Positive
        Long itemId,

        @NotNull
        @Positive
        Integer quantity

) {
}