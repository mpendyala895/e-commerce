package com.inventory.inventory_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryOrderRequestDTO {
    private List<OrderLineItemsDTO> orderLineItemsDTOList;
}
