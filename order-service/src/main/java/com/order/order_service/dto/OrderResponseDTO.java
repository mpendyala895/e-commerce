package com.order.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponseDTO {
    private Long id;
    private String orderNumber;
    private List<OrderLineItemsDTO> orderLineItemsList;
    private String orderStatus;
    private Long userId;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
}
