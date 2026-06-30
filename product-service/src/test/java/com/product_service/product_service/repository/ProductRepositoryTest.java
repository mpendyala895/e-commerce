package com.product_service.product_service.repository;

import com.product_service.product_service.model.Product;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.mongodb.test.autoconfigure.DataMongoTest;


import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataMongoTest
public class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Test
    @DisplayName("Product Should be Saved Successfully")
    void shouldSaveProduct() {

        Product product =
                new Product();

        product.setName("Redmi");

        product.setDescription("Redmi Mobile");

        product.setPrice(
                BigDecimal.valueOf(30000)
        );

        product.setSkuCode("Redmi 9");

        Product savedProduct =
                productRepository.save(product);

        assertNotNull(savedProduct);

        assertNotNull(savedProduct.getId());

        assertEquals(
                "Redmi",
                savedProduct.getName()
        );
    }

    @Test
    @DisplayName("Product Should be Found By id")
    void shouldFindProductById() {
        Product product =
                new Product();

        product.setName("Samsung A35");
        product.setDescription("Samsung A35");

        product.setPrice(
                BigDecimal.valueOf(30000)
        );

        product.setSkuCode("Samsung_A35");

        Product savedProduct =
                productRepository.save(product);

        Optional<Product> foundProduct =
                productRepository.findById(savedProduct.getId());

        assertTrue(foundProduct.isPresent());

        assertEquals("Samsung A35", foundProduct.get().getName());

    }

    @Test
    @DisplayName("Product Should be Deleted Successfully")
    void shouldReturnEmptyWhenProductNotFound(){
        Optional<Product> foundProduct =
                productRepository.findById("notfound");

        assertFalse(
                foundProduct.isPresent()
        );
    }
}