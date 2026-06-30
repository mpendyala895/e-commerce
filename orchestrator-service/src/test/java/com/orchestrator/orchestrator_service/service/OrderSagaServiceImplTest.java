package com.orchestrator.orchestrator_service.service;

import com.orchestrator.orchestrator_service.dto.OrderRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class OrderSagaServiceImplTest {

    @Mock
    private WebClient webClient;

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private WebClient.RequestBodySpec requestBodySpec;

    @SuppressWarnings("rawtypes")
    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private WebClient.ResponseSpec responseSpec;

    @InjectMocks
    private OrderSagaServiceImpl orderSagaService;

    private OrderRequestDTO requestDTO;

    @BeforeEach
    void setUp() {

        requestDTO =
                new OrderRequestDTO();
    }

    @Test
    void shouldPlaceOrderSuccessfully() {

        when(webClientBuilder.build())
                .thenReturn(webClient);

        when(webClient.post())
                .thenReturn(requestBodyUriSpec);

        when(requestBodyUriSpec.uri(
                "http://inventory-service/api/inventory/reserve"
        )).thenReturn(requestBodySpec);

        when(requestBodySpec.bodyValue(requestDTO))
                .thenReturn(requestHeadersSpec);

        when(requestHeadersSpec.retrieve())
                .thenReturn(responseSpec);

        when(responseSpec.bodyToMono(Boolean.class))
                .thenReturn(
                        Mono.just(true)
                );

        when(webClient.post())
                .thenReturn(requestBodyUriSpec);

        when(requestBodyUriSpec.uri(
                "http://order-service/api/orders/create"
        )).thenReturn(requestBodySpec);

        when(requestBodySpec.bodyValue(requestDTO))
                .thenReturn(requestHeadersSpec);

        when(requestHeadersSpec.retrieve())
                .thenReturn(responseSpec);

        when(responseSpec.bodyToMono(String.class))
                .thenReturn(
                        Mono.just(
                                "Order Created Successfully"
                        )
                );

        String response =
                orderSagaService.placeOrder(requestDTO);

        assertEquals(
                "Order Created Successfully",
                response
        );
    }

    @Test
    void shouldReturnOutOfStock() {

        when(webClientBuilder.build())
                .thenReturn(webClient);

        when(webClient.post())
                .thenReturn(requestBodyUriSpec);

        when(requestBodyUriSpec.uri(
                "http://inventory-service/api/inventory/reserve"
        )).thenReturn(requestBodySpec);

        when(requestBodySpec.bodyValue(requestDTO))
                .thenReturn(requestHeadersSpec);

        when(requestHeadersSpec.retrieve())
                .thenReturn(responseSpec);

        when(responseSpec.bodyToMono(Boolean.class))
                .thenReturn(
                        Mono.just(false)
                );

        String response =
                orderSagaService.placeOrder(requestDTO);

        assertEquals(
                "Saga Failed : Product Out Of Stock",
                response
        );
    }

    @Test
    void shouldReturnFallbackResponse() {

        String response =
                orderSagaService.fallbackMethod(
                        requestDTO,
                        new RuntimeException(
                                "Inventory Service Down"
                        )
                );

        assertEquals(
                "Inventory Service is Down. Please try again later.",
                response
        );
    }
}