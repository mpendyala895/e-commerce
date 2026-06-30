package com.orchestrator.orchestrator_service.controller;

import com.orchestrator.orchestrator_service.dto.OrderRequestDTO;
import com.orchestrator.orchestrator_service.service.OrderSagaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/saga")
@RequiredArgsConstructor
public class SagaController {

    private final OrderSagaService orderSagaService;

    @PostMapping("/order")
    public ResponseEntity<String> placeOrder(
            @RequestBody OrderRequestDTO request) {

        return ResponseEntity.ok(
                orderSagaService.placeOrder(request)
        );
    }
}
