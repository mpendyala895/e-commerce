package com.product_service.product_service.mapper;

import com.product_service.product_service.dto.ProductRequestDTO;
import com.product_service.product_service.dto.ProductResponseDTO;
import com.product_service.product_service.model.Product;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")

public interface ProductMapper {

    public ProductResponseDTO toDTO(Product product);
    public Product toEntity(ProductRequestDTO productRequestDTO);
}
