package com.shop.service;

import com.shop.dto.SaleRequestDto;
import com.shop.dto.SaleResponseDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

import java.sql.Timestamp;

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
}