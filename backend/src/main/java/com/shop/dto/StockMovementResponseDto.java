package com.shop.dto;

import java.time.LocalDateTime;

public record StockMovementResponseDto(
        Long id,
        Long itemId,
        String itemName,
        String sku,
        int previousQuantity,
        int quantityChanged,
        int newQuantity,
        String movementType,
        LocalDateTime createdAt
) {
}