package com.shop.service;

import com.shop.dto.DashboardSummaryResponseDto;
import com.shop.dto.TopSellingProductResponseDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    private final JdbcTemplate jdbcTemplate;

    public DashboardService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public DashboardSummaryResponseDto getDashboardSummary(
            LocalDate startDate,
            LocalDate endDate
    ) {

        return jdbcTemplate.queryForObject(
                "CALL sp_get_dashboard_summary(?, ?)",
                (rs, rowNum) -> new DashboardSummaryResponseDto(
                        rs.getLong("total_items"),
                        rs.getLong("total_quantity"),
                        rs.getLong("healthy_stock_items"),
                        rs.getLong("low_stock_items"),
                        rs.getLong("out_of_stock_items"),
                        rs.getBigDecimal("potential_stock_sales_value"),
                        rs.getLong("total_sales"),
                        rs.getBigDecimal("total_revenue"),
                        rs.getLong("total_units_sold")
                ),
                Date.valueOf(startDate),
                Date.valueOf(endDate)
        );
    }

    // Top-Selling Products
    public List<TopSellingProductResponseDto> getTopSellingProducts(
            LocalDate startDate,
            LocalDate endDate
    ) {

        return jdbcTemplate.query(
                "CALL sp_get_top_selling_products(?, ?)",
                (rs, rowNum) -> new TopSellingProductResponseDto(
                        rs.getLong("item_id"),
                        rs.getString("sku"),
                        rs.getString("item_name"),
                        rs.getLong("total_quantity_sold"),
                        rs.getBigDecimal("total_revenue")
                ),
                Date.valueOf(startDate),
                Date.valueOf(endDate)
        );
    }
}
