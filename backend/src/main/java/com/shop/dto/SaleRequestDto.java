package com.shop.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SaleRequestDto(

        @NotEmpty
        @Valid
        List<SaleItemRequestDto> items

) {
}