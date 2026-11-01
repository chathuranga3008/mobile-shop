package com.shop.service;

import com.shop.dto.SaleDetailResponseDto;
import com.shop.dto.SaleHistoryResponseDto;
import com.shop.dto.SaleRequestDto;
import com.shop.dto.SaleResponseDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

import java.sql.Timestamp;
import java.util.List;

@Service
public class SaleService {

    private final JdbcTemplate jdbcTemplate;
    private final JsonMapper jsonMapper;

    public SaleService(
            JdbcTemplate jdbcTemplate,
            JsonMapper jsonMapper
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.jsonMapper = jsonMapper;
    }

    // Create sale
    public SaleResponseDto createSale(SaleRequestDto request) {

        try {
            String itemsJson = jsonMapper.writeValueAsString(
                    request.items()
            );

            return jdbcTemplate.queryForObject(
                    "CALL sp_create_sale(?)",
                    (rs, rowNum) -> {

                        Timestamp timestamp = rs.getTimestamp("sale_date");

                        return new SaleResponseDto(
                                rs.getLong("sale_id"),
                                rs.getString("sale_number"),
                                timestamp != null
                                        ? timestamp.toLocalDateTime()
                                        : null,
                                rs.getBigDecimal("total_amount")
                        );
                    },
                    itemsJson
            );

        } catch (JacksonException e) {
            throw new IllegalStateException(
                    "Failed to convert sale items to JSON", e
            );
        }
    }

    // Get sales history
    public List<SaleHistoryResponseDto> getSalesHistory() {

        return jdbcTemplate.query(
                "CALL sp_get_sales_history()",
                (rs, rowNum) -> new SaleHistoryResponseDto(
                        rs.getLong("sale_id"),
                        rs.getString("sale_number"),
                        rs.getTimestamp("sale_date").toLocalDateTime(),
                        rs.getBigDecimal("total_amount"),
                        rs.getLong("product_count"),
                        rs.getLong("total_quantity")
                )
        );
    }

    // Get sale details
    public List<SaleDetailResponseDto> getSaleDetails(Long saleId) {

        return jdbcTemplate.query(
                "CALL sp_get_sale_details(?)",
                (rs, rowNum) -> new SaleDetailResponseDto(
                        rs.getLong("sale_id"),
                        rs.getString("sale_number"),
                        rs.getTimestamp("sale_date").toLocalDateTime(),
                        rs.getBigDecimal("total_amount"),
                        rs.getLong("sale_item_id"),
                        rs.getLong("item_id"),
                        rs.getString("sku"),
                        rs.getString("item_name"),
                        rs.getInt("quantity"),
                        rs.getBigDecimal("unit_price"),
                        rs.getBigDecimal("subtotal")
                ),
                saleId
        );
    }
}