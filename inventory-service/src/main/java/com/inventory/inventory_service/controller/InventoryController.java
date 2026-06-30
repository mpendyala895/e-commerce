package com.inventory.inventory_service.controller;

import com.inventory.inventory_service.dto.InventoryOrderRequestDTO;
import com.inventory.inventory_service.dto.InventoryResponseDTO;
import com.inventory.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<InventoryResponseDTO> inStock(
            @RequestParam List<String> skuCode) throws InterruptedException {

        return inventoryService.inStock(skuCode);
    }

    @PostMapping("/reserve")
    public Boolean reserveInventory(
            @RequestBody InventoryOrderRequestDTO request) {

        return inventoryService.reserveInventory(request);
    }

    @PostMapping("/release")
    public void releaseInventory(
            @RequestBody InventoryOrderRequestDTO request) {

        inventoryService.releaseInventory(request);
    }

    @GetMapping("/admin/all")
    public List<InventoryResponseDTO> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @PutMapping("/admin/update")
    public void updateStock(
            @RequestParam String skuCode,
            @RequestParam Integer quantity) {
        inventoryService.updateStock(skuCode, quantity);
    }

    @PostMapping("/admin/restock")
    public void restock(
            @RequestParam String skuCode,
            @RequestParam Integer quantity) {
        inventoryService.restock(skuCode, quantity);
    }

    @DeleteMapping("/admin/{skuCode}")
    public void deleteInventory(
            @PathVariable String skuCode) {
        inventoryService.deleteInventory(skuCode);
    }
}