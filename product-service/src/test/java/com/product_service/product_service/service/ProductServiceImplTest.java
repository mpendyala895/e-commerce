package com.product_service.product_service.service;

import com.product_service.product_service.dto.ProductRequestDTO;
import com.product_service.product_service.dto.ProductResponseDTO;
import com.product_service.product_service.mapper.ProductMapper;
import com.product_service.product_service.model.Product;
import com.product_service.product_service.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    void addProductSuccessfully() {

        ProductRequestDTO productRequestDTO =
                new ProductRequestDTO();

        Product product =
                new Product();

        Product savedProduct =
                new Product();

        ProductResponseDTO productResponseDTO =
                new ProductResponseDTO();

        when(productMapper.toEntity(productRequestDTO))
                .thenReturn(product);

        when(productRepository.save(product))
                .thenReturn(savedProduct);

        when(productMapper.toDTO(savedProduct))
                .thenReturn(productResponseDTO);

        ProductResponseDTO result =
                productService.addProduct(productRequestDTO);

        assertNotNull(result);

        assertEquals(
                productResponseDTO,
                result
        );

        verify(productMapper, times(1))
                .toEntity(productRequestDTO);

        verify(productRepository, times(1))
                .save(product);

        verify(productMapper, times(1))
                .toDTO(savedProduct);
    }

    @Test
    void shouldThrowExceptionWhenMapperFails() {

        ProductRequestDTO productRequestDTO =
                new ProductRequestDTO();

        when(productMapper.toEntity(productRequestDTO))
                .thenThrow(
                        new RuntimeException(
                                "Mapper Failed"
                        )
                );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> productService.addProduct(productRequestDTO)
                );

        assertEquals(
                "Mapper Failed",
                exception.getMessage()
        );

        verify(productRepository, never())
                .save(any(Product.class));
    }

    @Test
    void shouldThrowExceptionWhenRepositoryFails() {

        ProductRequestDTO productRequestDTO =
                new ProductRequestDTO();

        Product product =
                new Product();

        when(productMapper.toEntity(productRequestDTO))
                .thenReturn(product);

        when(productRepository.save(product))
                .thenThrow(
                        new RuntimeException(
                                "DataBase Error"
                        )
                );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> productService.addProduct(productRequestDTO)
                );

        assertEquals(
                "DataBase Error",
                exception.getMessage()
        );

        verify(productMapper, times(1))
                .toEntity(productRequestDTO);

        verify(productRepository, times(1))
                .save(product);

        verify(productMapper, never())
                .toDTO(any(Product.class));
    }

    @Test
    void shouldThrowExceptionWhenDtoConversionFails() {

        ProductRequestDTO productRequestDTO =
                new ProductRequestDTO();

        Product product =
                new Product();

        Product savedProduct =
                new Product();

        when(productMapper.toEntity(productRequestDTO))
                .thenReturn(product);

        when(productRepository.save(product))
                .thenReturn(savedProduct);

        when(productMapper.toDTO(savedProduct))
                .thenThrow(
                        new RuntimeException(
                                "Conversion Failed"
                        )
                );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> productService.addProduct(productRequestDTO)
                );

        assertEquals(
                "Conversion Failed",
                exception.getMessage()
        );

        verify(productMapper, times(1))
                .toEntity(productRequestDTO);

        verify(productRepository, times(1))
                .save(product);

        verify(productMapper, times(1))
                .toDTO(savedProduct);
    }

    @Test
    void shouldHandleNullRequests() {

        when(productMapper.toEntity(null))
                .thenThrow(
                        new RuntimeException(
                                "Null Request"
                        )
                );

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> productService.addProduct(null)
                );

        assertEquals(
                "Null Request",
                exception.getMessage()
        );

        verify(productRepository, never())
                .save(any(Product.class));
    }
}