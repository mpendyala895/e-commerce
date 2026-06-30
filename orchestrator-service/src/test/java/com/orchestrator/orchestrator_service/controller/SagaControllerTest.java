package com.orchestrator.orchestrator_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orchestrator.orchestrator_service.dto.OrderRequestDTO;
import com.orchestrator.orchestrator_service.service.OrderSagaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SagaController.class)
public class SagaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderSagaService orderSagaService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldPlaceOrderSuccessfully() throws Exception {
        OrderRequestDTO request = new OrderRequestDTO();

        when(orderSagaService.placeOrder(request))
                .thenReturn(
                        "Order Placed Successfully"
                );

        mockMvc.perform(
                post("/api/saga/order")
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(
                               objectMapper.writeValueAsString(
                                       request
                               )
                        )
        )
                .andExpect(status().isOk())
                .andExpect(
                        content().string(
                                "Order Placed Successfully"
                        )
                );
    }


    @Test
    void shouldReturnOutOfStockMessage() throws Exception {
        OrderRequestDTO requestDTO=new OrderRequestDTO();

        when(orderSagaService.placeOrder(requestDTO))
                .thenReturn(
                        "Saga Failed : Product Out Of Stock");

        mockMvc.perform(
                post("/api/saga/order")
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(objectMapper.writeValueAsString(
                                requestDTO
                        ))
        ).andExpect(status().isOk())
                .andExpect(
                        content().string("Saga Failed : Product Out Of Stock")
                );

    }

    @Test
    void shouldFallbackMethod() throws Exception {
        OrderRequestDTO requestDTO=new OrderRequestDTO();

        when(orderSagaService.placeOrder(requestDTO))
                .thenReturn(
                        "Inventory Service is Down . Please try again later"
                );

        mockMvc.perform(
                post("/api/saga/order")
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(objectMapper.writeValueAsString(
                                requestDTO
                        ))
        ).andExpect(status().isOk())
                .andExpect(
                        content().string("Inventory Service is Down . Please try again later")
                );
    }

    void shouldHandleException() throws Exception {
        OrderRequestDTO requestDTO = new  OrderRequestDTO();

        when(orderSagaService.placeOrder(requestDTO))
                .thenThrow(
                        new Exception(
                                "Saga Exception"
                        )
                );

        mockMvc.perform(
                post("/api/saga/order")
                        .contentType(
                                MediaType.APPLICATION_JSON
                        )
                        .content(objectMapper.writeValueAsString(
                                requestDTO
                        ))
        ).andExpect(status().is5xxServerError());
    }
}
