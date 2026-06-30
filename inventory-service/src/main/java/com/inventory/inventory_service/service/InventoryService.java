package com.inventory.inventory_service.service;

import com.inventory.inventory_service.dto.InventoryOrderRequestDTO;
import com.inventory.inventory_service.dto.InventoryResponseDTO;
import com.inventory.inventory_service.dto.OrderLineItemsDTO;
import com.inventory.inventory_service.model.Inventory;
import com.inventory.inventory_service.repository.InventoryRepository;
import com.inventory.inventory_service.config.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final org.springframework.kafka.core.KafkaTemplate<String, com.inventory.inventory_service.event.OrderPlacedEvent> kafkaTemplate;

    @Transactional(readOnly = true)
    public List<InventoryResponseDTO> inStock(
            List<String> skuCode) {

        log.info("Checking Inventory");

        return inventoryRepository
                .findBySkuCodeIn(skuCode)
                .stream()
                .map(inventory ->
                        InventoryResponseDTO.builder()
                                .skuCode(inventory.getSkuCode())
                                .inStock(
                                        inventory.getQuantity() > 0
                                )
                                .build()
                ).toList();
    }

    @Transactional
    public boolean reserveInventory(InventoryOrderRequestDTO request) {

        log.info("========== INVENTORY RESERVATION START ==========");

        if (request == null || request.getOrderLineItemsDTOList() == null
                || request.getOrderLineItemsDTOList().isEmpty()) {

            log.error("Inventory request is null or empty");
            throw new IllegalArgumentException("Inventory request cannot be null or empty");
        }

        log.info("Received {} order items",
                request.getOrderLineItemsDTOList().size());

        // Check stock availability first
        for (OrderLineItemsDTO item : request.getOrderLineItemsDTOList()) {

            log.info("Checking SKU: {}, Requested Quantity: {}",
                    item.getSkuCode(), item.getQuantity());

            Inventory inventory = inventoryRepository
                    .findBySkuCode(item.getSkuCode())
                    .orElseThrow(() -> {
                        log.error("Inventory not found for SKU: {}", item.getSkuCode());
                        return new ResourceNotFoundException(
                                "Inventory not found for SKU: " + item.getSkuCode());
                    });

            log.info("Available Quantity for {} : {}",
                    inventory.getSkuCode(), inventory.getQuantity());

            if (inventory.getQuantity() < item.getQuantity()) {
                log.warn("Insufficient stock for SKU {}. Available={}, Requested={}",
                        item.getSkuCode(),
                        inventory.getQuantity(),
                        item.getQuantity());

                return false;
            }
        }

        // Reserve inventory
        for (OrderLineItemsDTO item : request.getOrderLineItemsDTOList()) {

            Inventory inventory = inventoryRepository
                    .findBySkuCode(item.getSkuCode())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Inventory not found for SKU: " + item.getSkuCode()));

            inventory.setQuantity(inventory.getQuantity() - item.getQuantity());

            Inventory saved = inventoryRepository.save(inventory);

            log.info("Reserved {} units of {}. Remaining Stock={}",
                    item.getQuantity(),
                    saved.getSkuCode(),
                    saved.getQuantity());

            // Low stock notification
            if (saved.getQuantity() < 10) {

                try {

                    kafkaTemplate.send(
                            "notificationTopic",
                            new com.inventory.inventory_service.event.OrderPlacedEvent(
                                    saved.getSkuCode(),
                                    "Low stock warning for SKU: "
                                            + saved.getSkuCode()
                                            + " (Remaining: "
                                            + saved.getQuantity()
                                            + ")",
                                    "LOW_INVENTORY"
                            )
                    );

                    log.info("Low stock notification sent for {}",
                            saved.getSkuCode());

                } catch (Exception e) {

                    log.error("Kafka notification failed for SKU {} : {}",
                            saved.getSkuCode(),
                            e.getMessage(),
                            e);
                }
            }
        }

        log.info("========== INVENTORY RESERVED SUCCESSFULLY ==========");

        return true;
    }

    @Transactional
    public void releaseInventory(
            InventoryOrderRequestDTO  request) {

        for (OrderLineItemsDTO item :
                request.getOrderLineItemsDTOList()) {

            Inventory inventory =
                    inventoryRepository
                            .findBySkuCode(item.getSkuCode())
                            .orElseThrow();

            inventory.setQuantity(
                    inventory.getQuantity()
                            + item.getQuantity()
            );

            inventoryRepository.save(inventory);
        }
    }

    @Transactional(readOnly = true)
    public List<InventoryResponseDTO> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(inventory -> InventoryResponseDTO.builder()
                        .skuCode(inventory.getSkuCode())
                        .inStock(inventory.getQuantity() > 0)
                        .quantity(inventory.getQuantity())
                        .build())
                .toList();
    }

    @Transactional
    public void updateStock(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElse(null);
        if (inventory == null) {
            inventory = new Inventory();
            inventory.setSkuCode(skuCode);
        }
        inventory.setQuantity(quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void restock(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElse(null);
        if (inventory == null) {
            inventory = new Inventory();
            inventory.setSkuCode(skuCode);
            inventory.setQuantity(0);
        }
        inventory.setQuantity(inventory.getQuantity() + quantity);
        inventoryRepository.save(inventory);
    }

    @Transactional
    public void deleteInventory(String skuCode) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found"));
        inventoryRepository.delete(inventory);
    }
}