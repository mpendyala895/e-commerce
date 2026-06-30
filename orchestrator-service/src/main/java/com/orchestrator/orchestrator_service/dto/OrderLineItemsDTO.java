package com.orchestrator.orchestrator_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderLineItemsDTO {

    private String skuCode;
    private BigDecimal price;
    private Integer quantity;
}
