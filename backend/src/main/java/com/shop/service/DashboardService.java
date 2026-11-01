
package com.shop.service;

import com.shop.dto.DashboardSummaryResponseDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;

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

        String sql = "CALL sp_get_dashboard_summary(?, ?)";

        return jdbcTemplate.queryForObject(
                sql,
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
}
