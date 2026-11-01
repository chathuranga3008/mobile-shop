package com.shop.controller;

import com.shop.dto.SaleRequestDto;
import com.shop.dto.SaleResponseDto;
import com.shop.service.SaleService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sales")
@CrossOrigin(origins = "http://localhost:4200")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    // Create a new sale
    @PostMapping
    public ResponseEntity<SaleResponseDto> createSale(
            @Valid @RequestBody SaleRequestDto request
    ) {
        SaleResponseDto response = saleService.createSale(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}