package com.product_service.product_service.service;

import com.product_service.product_service.dto.ProductRequestDTO;
import com.product_service.product_service.dto.ProductResponseDTO;
import com.product_service.product_service.mapper.ProductMapper;
import com.product_service.product_service.model.Product;
import com.product_service.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductResponseDTO addProduct(ProductRequestDTO productRequestDTO) {
        Product newProduct = productMapper.toEntity(productRequestDTO);

        Product product=productRepository.save(newProduct);

        return productMapper.toDTO(product);
    }

    @Override
    public List<ProductResponseDTO> getAllProducts() {
        List<Product> products = productRepository.findAll();

        return products.stream().map(product-> productMapper.toDTO(product)).toList();
    }

    @Override
    public ProductResponseDTO updateProduct(String id, ProductRequestDTO productRequestDTO) {
        com.product_service.product_service.model.Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new com.product_service.product_service.config.ResourceNotFoundException("Product not found with id " + id));

        existingProduct.setName(productRequestDTO.getName());
        existingProduct.setDescription(productRequestDTO.getDescription());
        existingProduct.setPrice(productRequestDTO.getPrice());
        existingProduct.setSkuCode(productRequestDTO.getSkuCode());
        existingProduct.setImageUrl(productRequestDTO.getImageUrl());
        existingProduct.setCategory(productRequestDTO.getCategory());

        com.product_service.product_service.model.Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toDTO(updatedProduct);
    }

    @Override
    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new com.product_service.product_service.config.ResourceNotFoundException("Product not found with id " + id);
        }
        productRepository.deleteById(id);
    }

    @Override
    public ProductResponseDTO getProductById(String id) {
        com.product_service.product_service.model.Product product = productRepository.findById(id)
                .orElseThrow(() -> new com.product_service.product_service.config.ResourceNotFoundException("Product not found with id " + id));
        return productMapper.toDTO(product);
    }

    @Override
    public ProductResponseDTO getProductBySku(String skuCode) {
        com.product_service.product_service.model.Product product = productRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new com.product_service.product_service.config.ResourceNotFoundException("Product not found with skuCode " + skuCode));
        return productMapper.toDTO(product);
    }

    @Override
    public List<ProductResponseDTO> getProductsBySkus(List<String> skuCodes) {
        List<com.product_service.product_service.model.Product> products = productRepository.findBySkuCodeIn(skuCodes);
        return products.stream().map(product -> productMapper.toDTO(product)).toList();
    }
}
