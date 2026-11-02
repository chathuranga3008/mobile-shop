package com.shop.controller;

import com.shop.dto.DashboardSummaryResponseDto;
import com.shop.dto.TopSellingProductResponseDto;
import com.shop.service.DashboardService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // Get dashboard summary
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponseDto> getDashboardSummary(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {
        validateDateRange(startDate, endDate);

        return ResponseEntity.ok(
                dashboardService.getDashboardSummary(startDate, endDate)
        );
    }

    // Get top-selling products
    @GetMapping("/top-selling-products")
    public ResponseEntity<List<TopSellingProductResponseDto>> getTopSellingProducts(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate
    ) {
        validateDateRange(startDate, endDate);

        return ResponseEntity.ok(
                dashboardService.getTopSellingProducts(startDate, endDate)
        );
    }

    // Validate date range
    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate
    ) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "Start date cannot be after end date."
            );
        }
    }
}