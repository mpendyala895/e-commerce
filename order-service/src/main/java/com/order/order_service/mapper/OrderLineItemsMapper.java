package com.order.order_service.mapper;

import com.order.order_service.dto.OrderLineItemsDTO;
import com.order.order_service.model.OrderLineItems;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderLineItemsMapper {
    public OrderLineItemsDTO toDTO(OrderLineItems orderLineItems);
    public OrderLineItems toEntity(OrderLineItemsDTO orderLineItemsDTO);
}
