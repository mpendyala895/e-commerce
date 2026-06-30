package com.order.order_service.controller;

import com.order.order_service.dto.OrderRequestDTO;
import com.order.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<String> createOrder(
            @RequestBody OrderRequestDTO orderRequestDTO) {

        orderService.createOrder(orderRequestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Order Created Successfully");
    }

    @PutMapping("/cancel/{orderNumber}")
    public ResponseEntity<String> cancelOrder(
            @PathVariable String orderNumber) {

        orderService.cancelOrder(orderNumber);

        return ResponseEntity.ok("Order Cancelled");
    }

    @GetMapping
    public ResponseEntity<java.util.List<com.order.order_service.dto.OrderResponseDTO>> getUserOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || authHeader.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        java.util.Map<String, Object> claims = com.order.order_service.config.JwtUtils.getClaims(authHeader);
        Object userIdObj = claims.get("userId");
        if (userIdObj == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = Long.valueOf(userIdObj.toString());
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<java.util.List<com.order.order_service.dto.OrderResponseDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/admin/status/{orderNumber}")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable String orderNumber,
            @RequestParam String status) {
        orderService.updateOrderStatus(orderNumber, status);
        return ResponseEntity.ok("Order Status Updated");
    }

    @DeleteMapping("/admin/{orderNumber}")
    public ResponseEntity<String> deleteOrder(
            @PathVariable String orderNumber) {
        orderService.deleteOrder(orderNumber);
        return ResponseEntity.ok("Order Deleted");
    }
}