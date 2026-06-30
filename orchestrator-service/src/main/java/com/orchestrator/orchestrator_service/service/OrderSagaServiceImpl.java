package com.orchestrator.orchestrator_service.service;

import com.orchestrator.orchestrator_service.dto.OrderRequestDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderSagaServiceImpl
        implements OrderSagaService {

    private final WebClient.Builder webClient;

    @Override
    @CircuitBreaker(
            name = "inventory",
            fallbackMethod = "fallbackMethod"
    )
    public String placeOrder(
            OrderRequestDTO request) {

        try {

            log.info(
                    "Starting Saga Transaction"
            );

            log.info(
                    "Calling Inventory Service"
            );

            Boolean inventoryReserved =
                    webClient.build()
                            .post()
                            .uri(
                                    "http://inventory-service/api/inventory/reserve"
                            )
                            .bodyValue(request)
                            .retrieve()
                            .bodyToMono(Boolean.class)
                            .block();

            log.info(
                    "Inventory Response : {}",
                    inventoryReserved
            );

            if(Boolean.FALSE.equals(
                    inventoryReserved
            )) {

                log.error(
                        "Inventory Reservation Failed"
                );

                log.error(
                        "Saga Failed Due To Out Of Stock"
                );

                return "Saga Failed : Product Out Of Stock";
            }

            log.info(
                    "Calling Order Service"
            );

            String orderResponse =
                    webClient.build()
                            .post()
                            .uri(
                                    "http://order-service/api/orders/create"
                            )
                            .bodyValue(request)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();

            log.info(
                    "Order Created Successfully"
            );

            log.info(
                    "Saga Completed Successfully"
            );

            return orderResponse;

        } catch (Exception e) {

            log.error(
                    "Saga Failed : {}",
                    e.getMessage()
            );

            log.info(
                    "Starting Compensation Transaction"
            );

            compensateInventory(request);

            throw new RuntimeException(
                    "Saga Failed : "
                            + e.getMessage()
            );
        }
    }

    public String fallbackMethod(
            OrderRequestDTO request,
            Exception exception) {

        log.error(
                "Circuit Breaker Activated : {}",
                exception.getMessage()
        );

        return
                "Inventory Service is Down. Please try again later.";
    }

    private void compensateInventory(
            OrderRequestDTO request) {

        try {

            log.info(
                    "Releasing Reserved Inventory"
            );

            webClient.build()
                    .post()
                    .uri(
                            "http://inventory-service/api/inventory/release"
                    )
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            log.info(
                    "Inventory Released Successfully"
            );

        } catch (Exception e) {

            log.error(
                    "Compensation Failed : {}",
                    e.getMessage()
            );
        }
    }
}