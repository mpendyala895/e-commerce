package com.product_service.product_service.service;

import com.product_service.product_service.dto.ProductRequestDTO;
import com.product_service.product_service.dto.ProductResponseDTO;
import com.product_service.product_service.model.Product;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ProductService {
    ProductResponseDTO addProduct(ProductRequestDTO productRequestDTO);

    List<ProductResponseDTO> getAllProducts();

    ProductResponseDTO updateProduct(String id, ProductRequestDTO productRequestDTO);

    void deleteProduct(String id);

    ProductResponseDTO getProductById(String id);

    ProductResponseDTO getProductBySku(String skuCode);

    List<ProductResponseDTO> getProductsBySkus(List<String> skuCodes);
}
