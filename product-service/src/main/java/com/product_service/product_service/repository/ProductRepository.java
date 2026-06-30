package com.product_service.product_service.repository;

import com.product_service.product_service.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends MongoRepository<Product,String> {
    Optional<Product> findBySkuCode(String skuCode);
    List<Product> findBySkuCodeIn(List<String> skuCodes);
}

