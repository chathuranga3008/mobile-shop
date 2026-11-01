
package com.shop.dto;

import java.math.BigDecimal;

public record DashboardSummaryResponseDto(
        Long totalItems,
        Long totalQuantity,
        Long healthyStockItems,
        Long lowStockItems,
        Long outOfStockItems,
        BigDecimal potentialStockSalesValue,
        Long totalSales,
        BigDecimal totalRevenue,
        Long totalUnitsSold
) {
}
