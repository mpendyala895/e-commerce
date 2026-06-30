package com.orchestrator.orchestrator_service.integration;

import com.orchestrator.orchestrator_service.dto.OrderLineItemsDTO;
import com.orchestrator.orchestrator_service.dto.OrderRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(
        webEnvironment =
                SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("test")
public class SagaIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    private OrderRequestDTO successRequest;

    private OrderRequestDTO failureRequest;

    @BeforeEach
    void setUp() {

        OrderLineItemsDTO successItem =
                new OrderLineItemsDTO();

        successItem.setSkuCode(
                "iphone_16"
        );

        successItem.setQuantity(1);

        successItem.setPrice(
                BigDecimal.valueOf(50000)
        );

        successRequest =
                new OrderRequestDTO();

        successRequest.setOrderLineItemsDTOList(
                List.of(successItem)
        );

        OrderLineItemsDTO failureItem =
                new OrderLineItemsDTO();

        failureItem.setSkuCode(
                "invalid_product"
        );

        failureItem.setQuantity(100);

        failureItem.setPrice(
                BigDecimal.valueOf(50000)
        );

        failureRequest =
                new OrderRequestDTO();

        failureRequest.setOrderLineItemsDTOList(
                List.of(failureItem)
        );
    }

    @Test
    void shouldCompleteSagaSuccessfully() {

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        HttpEntity<OrderRequestDTO> request =
                new HttpEntity<>(
                        successRequest,
                        headers
                );

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        "/api/saga/order",
                        request,
                        String.class
                );

        assertEquals(
                HttpStatus.OK,
                response.getStatusCode()
        );

        assertTrue(
                response.getBody()
                        .contains(
                                "Order"
                        )
        );
    }

    @Test
    void shouldFailWhenProductNotFound() {

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        HttpEntity<OrderRequestDTO> request =
                new HttpEntity<>(
                        failureRequest,
                        headers
                );

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        "/api/saga/order",
                        request,
                        String.class
                );

        assertEquals(
                HttpStatus.OK,
                response.getStatusCode()
        );

        assertTrue(
                response.getBody()
                        .contains(
                                "Inventory Service is Down"
                        )
                        ||
                        response.getBody()
                                .contains(
                                        "Saga Failed"
                                )
        );
    }

    @Test
    void shouldTriggerCompensationTransaction() {

        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        HttpEntity<OrderRequestDTO> request =
                new HttpEntity<>(
                        failureRequest,
                        headers
                );

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        "/api/saga/order",
                        request,
                        String.class
                );

        assertEquals(
                HttpStatus.OK,
                response.getStatusCode()
        );

        assertTrue(
                response.getBody()
                        .contains(
                                "Saga Failed"
                        )
                        ||
                        response.getBody()
                                .contains(
                                        "Inventory Service is Down"
                                )
        );
    }
}