package com.order.order_service.dto;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequestDTO {
    private List<OrderLineItemsDTO> orderLineItemsDTOList;
    private Long userId;
}
