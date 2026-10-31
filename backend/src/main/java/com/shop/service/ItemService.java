package com.shop.service;

import com.shop.dto.ItemRequestDto;
import com.shop.dto.ItemResponseDto;

import com.shop.dto.StockMovementResponseDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    private final JdbcTemplate jdbcTemplate;
    // Maps database columns to ItemResponseDto
    private final RowMapper<ItemResponseDto> itemMapper =
            (rs, rowNum) -> {

                Timestamp timestamp = rs.getTimestamp("created_at");

                return new ItemResponseDto(
                        rs.getLong("id"),
                        rs.getString("sku"),
                        rs.getString("name"),
                        rs.getString("brand"),
                        rs.getString("category"),
                        rs.getBigDecimal("price"),
                        rs.getInt("quantity"),
                        rs.getInt("low_stock_threshold"),
                        timestamp != null
                                ? timestamp.toLocalDateTime()
                                : null
                );
            };

    public ItemService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Get all items
    public List<ItemResponseDto> getAllItems() {
        return jdbcTemplate.query(
                "CALL sp_get_items()",
                itemMapper
        );
    }

    // Get item by ID
    public Optional<ItemResponseDto> getItemById(Long id) {

        List<ItemResponseDto> items = jdbcTemplate.query(
                "CALL sp_get_item_by_id(?)",
                itemMapper,
                id
        );

        return items.stream().findFirst();
    }

    // Create item
    public ItemResponseDto createItem(ItemRequestDto item) {

        return jdbcTemplate.queryForObject(
                "CALL sp_create_item(?, ?, ?, ?, ?, ?, ?)",
                itemMapper,
                item.sku(),
                item.name(),
                item.brand(),
                item.category(),
                item.price(),
                item.quantity(),
                item.lowStockThreshold()
        );
    }

    // Update item
    public Optional<ItemResponseDto> updateItem(
            Long id,
            ItemRequestDto item
    ) {

        List<ItemResponseDto> items = jdbcTemplate.query(
                "CALL sp_update_item(?, ?, ?, ?, ?, ?, ?, ?)",
                itemMapper,
                id,
                item.sku(),
                item.name(),
                item.brand(),
                item.category(),
                item.price(),
                item.quantity(),
                item.lowStockThreshold()
        );

        return items.stream().findFirst();
    }

    // Restock item
    public Optional<ItemResponseDto> restockItem(
            Long id,
            int quantityToAdd
    ) {

        List<ItemResponseDto> items = jdbcTemplate.query(
                "CALL sp_restock_item(?, ?)",
                itemMapper,
                id,
                quantityToAdd
        );

        return items.stream().findFirst();
    }

    // Delete item
    public boolean deleteItem(Long id) {

        Integer affectedRows = jdbcTemplate.queryForObject(
                "CALL sp_delete_item(?)",
                Integer.class,
                id
        );

        return affectedRows != null && affectedRows > 0;
    }

    // Get low-stock items
    public List<ItemResponseDto> getLowStockItems() {

        return jdbcTemplate.query(
                "CALL sp_get_low_stock_items()",
                itemMapper
        );
    }

    public List<StockMovementResponseDto> getStockMovements() {

        String sql = "CALL sp_get_stock_movements()";

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new StockMovementResponseDto(
                        rs.getLong("id"),
                        rs.getLong("item_id"),
                        rs.getString("item_name"),
                        rs.getString("sku"),
                        rs.getInt("previous_quantity"),
                        rs.getInt("quantity_changed"),
                        rs.getInt("new_quantity"),
                        rs.getString("movement_type"),
                        rs.getTimestamp("created_at").toLocalDateTime()
                )
        );
    }
}
