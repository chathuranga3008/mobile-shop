package com.shop.controller;

import com.shop.dto.ItemRequestDto;
import com.shop.dto.ItemResponseDto;
import com.shop.dto.StockMovementResponseDto;
import com.shop.service.ItemService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/items")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    // Get all items
    @GetMapping
    public List<ItemResponseDto> getAllItems() {
        return itemService.getAllItems();
    }

    // Get item by ID
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDto> getItemById(
            @PathVariable Long id
    ) {
        return itemService.getItemById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create item
    @PostMapping
    public ResponseEntity<ItemResponseDto> createItem(
            @Valid @RequestBody ItemRequestDto request
    ) {
        ItemResponseDto created = itemService.createItem(request);

        return ResponseEntity
                .created(URI.create("/api/items/" + created.id()))
                .body(created);
    }

    // Update item
    @PutMapping("/{id}")
    public ResponseEntity<ItemResponseDto> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ItemRequestDto request
    ) {
        return itemService.updateItem(id, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id
    ) {
        if (!itemService.deleteItem(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    // Restock item
    @PostMapping("/{id}/restock")
    public ResponseEntity<ItemResponseDto> restockItem(
            @PathVariable Long id,
            @RequestParam int quantityToAdd
    ) {
        return itemService.restockItem(id, quantityToAdd)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get low-stock items
    @GetMapping("/low-stock")
    public List<ItemResponseDto> getLowStockItems() {
        return itemService.getLowStockItems();
    }

    @GetMapping("/stock-movements")
    public ResponseEntity<List<StockMovementResponseDto>> getStockMovements() {
        return ResponseEntity.ok(itemService.getStockMovements());
    }
}
