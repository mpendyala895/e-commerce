package com.product_service.product_service.controller;

import com.product_service.product_service.event.InventoryEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class InventoryProducerController {
    private final KafkaTemplate<String, InventoryEvent> kafkaTemplate;

    @PostMapping("/inventory-event")
    public String sendInventory(@RequestBody InventoryEvent inventoryEvent) {
        kafkaTemplate.send("inventoryTopic", inventoryEvent);

        return "inventory-event-sent";
    }
}
