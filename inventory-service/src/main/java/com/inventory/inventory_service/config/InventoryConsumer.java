package com.inventory.inventory_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.inventory_service.event.InventoryEvent;
import com.inventory.inventory_service.model.Inventory;
import com.inventory.inventory_service.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryConsumer {

    private final InventoryRepository
            inventoryRepository;

    private final ObjectMapper
            objectMapper;

    @KafkaListener(
            topics = "inventoryTopic",
            groupId = "inventoryId"
    )
    public void consume(String message) {

        try {

            log.info(
                    "Raw Kafka Message : {}",
                    message
            );

            InventoryEvent inventoryEvent =
                    objectMapper.readValue(
                            message,
                            InventoryEvent.class
                    );

            log.info(
                    "Converted Event : {}",
                    inventoryEvent
            );

            Inventory inventory =
                    inventoryRepository
                            .findBySkuCode(
                                    inventoryEvent.getSkuCode()
                            )
                            .orElse(null);

            if (inventory == null) {

                inventory = new Inventory();

                inventory.setSkuCode(
                        inventoryEvent.getSkuCode()
                );
            }

            inventory.setQuantity(
                    inventoryEvent.getQuantity()
            );

            Inventory savedInventory =
                    inventoryRepository.save(
                            inventory
                    );

            inventoryRepository.flush();

            System.out.println(savedInventory);

            log.info(
                    "Inventory Saved Successfully"
            );

        } catch (Exception e) {

            log.error(
                    "Kafka Consumer Error : {}",
                    e.getMessage()
            );
        }
    }
}