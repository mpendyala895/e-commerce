package com.order.order_service.service;

import com.order.order_service.dto.OrderRequestDTO;

public interface OrderService {

    void createOrder(OrderRequestDTO orderRequestDTO);

    void cancelOrder(String orderNumber);

    java.util.List<com.order.order_service.dto.OrderResponseDTO> getUserOrders(Long userId);

    java.util.List<com.order.order_service.dto.OrderResponseDTO> getAllOrders();

    void updateOrderStatus(String orderNumber, String status);

    void deleteOrder(String orderNumber);
}