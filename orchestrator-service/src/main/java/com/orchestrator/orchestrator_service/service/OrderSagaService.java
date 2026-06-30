package com.orchestrator.orchestrator_service.service;

import com.orchestrator.orchestrator_service.dto.OrderRequestDTO;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public interface OrderSagaService {

    String placeOrder(OrderRequestDTO request);
}
