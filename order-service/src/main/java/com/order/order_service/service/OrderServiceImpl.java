package com.order.order_service.service;

import com.order.order_service.dto.OrderRequestDTO;
import com.order.order_service.event.OrderPlacedEvent;
import com.order.order_service.mapper.OrderLineItemsMapper;
import com.order.order_service.model.Order;
import com.order.order_service.model.OrderLineItems;
import com.order.order_service.model.OrderStatus;
import com.order.order_service.repository.OrderRepository;
import com.order.order_service.config.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl
        implements OrderService {

    private final OrderRepository
            orderRepository;

    private final OrderLineItemsMapper
            orderLineItemsMapper;

    private final com.order.order_service.mapper.OrderMapper
            orderMapper;

    private final KafkaTemplate<
            String,
            OrderPlacedEvent>
            kafkaTemplate;

    @Override
    public void createOrder(
            OrderRequestDTO orderRequestDTO) {

        try {

            log.info("Creating Order");

            Order order = new Order();

            order.setOrderNumber(
                    UUID.randomUUID().toString()
            );

            order.setOrderStatus(
                    OrderStatus.PENDING
            );

            List<OrderLineItems> orderLineItems =
                    orderRequestDTO
                            .getOrderLineItemsDTOList()
                            .stream()
                            .map(
                                    orderLineItemsMapper::toEntity
                            )
                            .toList();

            order.setOrderLineItemsList(
                    orderLineItems
            );

            order.setUserId(
                    orderRequestDTO.getUserId()
            );

            java.math.BigDecimal totalPrice = orderLineItems.stream()
                    .map(item -> item.getPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity())))
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            order.setTotalPrice(totalPrice);
            order.setCreatedAt(java.time.LocalDateTime.now());

            orderRepository.save(order);

            log.info(
                    "Order Created Successfully : {}",
                    order.getOrderNumber()
            );

            kafkaTemplate.send(
                    "notificationTopic",
                    new OrderPlacedEvent(
                            order.getOrderNumber(),
                            "Order Created Successfully",
                            "SUCCESS"
                    )
            );

            log.info(
                    "Success Event Sent To Kafka : {}",
                    order.getOrderNumber()
            );

        } catch (Exception e) {

            log.error(
                    "Order Creation Failed : {}",
                    e.getMessage()
            );

            kafkaTemplate.send(
                    "notificationTopic",
                    new OrderPlacedEvent(
                            "N/A",
                            "Order Creation Failed : "
                                    + e.getMessage(),
                            "FAILED"
                    )
            );

            log.info(
                    "Failure Event Sent To Kafka"
            );

            throw new RuntimeException(
                    "Order Creation Failed : "
                            + e.getMessage()
            );
        }
    }

    @Override
    public void cancelOrder(
            String orderNumber) {

        log.info(
                "Cancelling Order : {}",
                orderNumber
        );

        Order order =
                orderRepository
                        .findByOrderNumber(
                                orderNumber
                        );

        if (order == null) {

            log.error(
                    "Order Not Found : {}",
                    orderNumber
            );

            kafkaTemplate.send(
                    "notificationTopic",
                    new OrderPlacedEvent(
                            orderNumber,
                            "Order Cancellation Failed",
                            "FAILED"
                    )
            );

            throw new ResourceNotFoundException(
                    "Order Not Found"
            );
        }

        order.setOrderStatus(
                OrderStatus.CANCELLED
        );

        orderRepository.save(order);

        kafkaTemplate.send(
                "notificationTopic",
                new OrderPlacedEvent(
                        orderNumber,
                        "Order Cancelled Successfully",
                        "CANCELLED"
                )
        );

        log.info(
                "Order Cancelled : {}",
                orderNumber
        );
    }

    @Override
    public java.util.List<com.order.order_service.dto.OrderResponseDTO> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId)
                .stream()
                .map(orderMapper::toResponseDTO)
                .toList();
    }

    @Override
    public java.util.List<com.order.order_service.dto.OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(orderMapper::toResponseDTO)
                .toList();
    }

    @Override
    public void updateOrderStatus(String orderNumber, String status) {
        com.order.order_service.model.Order order = orderRepository.findByOrderNumber(orderNumber);
        if (order == null) {
            throw new com.order.order_service.config.ResourceNotFoundException("Order Not Found");
        }
        order.setOrderStatus(com.order.order_service.model.OrderStatus.valueOf(status.toUpperCase()));
        orderRepository.save(order);

        kafkaTemplate.send(
                "notificationTopic",
                new OrderPlacedEvent(
                        orderNumber,
                        "Order status updated to: " + status,
                        status.toUpperCase()
                )
        );
    }

    @Override
    public void deleteOrder(String orderNumber) {
        com.order.order_service.model.Order order = orderRepository.findByOrderNumber(orderNumber);
        if (order == null) {
            throw new com.order.order_service.config.ResourceNotFoundException("Order Not Found");
        }
        orderRepository.delete(order);
    }
}