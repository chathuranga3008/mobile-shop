package com.shop.service;

import com.shop.dto.ItemDto;
import com.shop.dto.ItemRequestDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<ItemDto> itemMapper = (rs, rowNum) ->
            new ItemDto(
                    rs.getLong("id"),
                    rs.getString("sku"),
                    rs.getString("name"),
                    rs.getString("brand"),
                    rs.getString("category"),
                    rs.getBigDecimal("price"),
                    rs.getInt("quantity"),
                    rs.getInt("low_stock_threshold"),
                    rs.getTimestamp("created_at").toLocalDateTime()
            );

    public ItemService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ItemDto> getAllItems() {
        return jdbcTemplate.query(
                "CALL sp_get_items()",
                itemMapper
        );
    }

    public Optional<ItemDto> getItemById(Long id) {
        List<ItemDto> items = jdbcTemplate.query(
                "CALL sp_get_item_by_id(?)",
                itemMapper,
                id
        );

        return items.stream().findFirst();
    }

    public ItemDto createItem(ItemRequestDto item) {
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

    public Optional<ItemDto> updateItem(
            Long id,
            ItemRequestDto item
    ) {
        List<ItemDto> items = jdbcTemplate.query(
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

    public boolean deleteItem(Long id) {
        Integer affectedRows = jdbcTemplate.queryForObject(
                "CALL sp_delete_item(?)",
                Integer.class,
                id
        );

        return affectedRows != null && affectedRows > 0;
    }
}