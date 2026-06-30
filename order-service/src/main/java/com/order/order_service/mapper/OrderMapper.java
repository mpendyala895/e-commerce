package com.order.order_service.mapper;

import com.order.order_service.dto.OrderRequestDTO;
import com.order.order_service.dto.OrderResponseDTO;
import com.order.order_service.model.Order;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {OrderLineItemsMapper.class})
public interface OrderMapper {
    public OrderRequestDTO toDTO(Order order);
    public Order toEntity(OrderRequestDTO orderRequestDTO);
    public OrderResponseDTO toResponseDTO(Order order);
}
