package com.example.supply_manager.repository;

import com.example.supply_manager.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    Optional<Product> findByCode(String code);
    
    List<Product> findByNameContainingIgnoreCase(String name);
    
    List<Product> findByCategoryId(Long categoryId);
    
    List<Product> findBySupplierId(Long supplierId);
    
    List<Product> findByQuantityLessThan(Integer quantity);
    
    @Query("SELECT p FROM Product p WHERE p.quantity < p.minimumStock")
    List<Product> findLowStockProducts();
    
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.quantity < p.minimumStock")
    List<Product> findLowStockProductsByCategory(@Param("categoryId") Long categoryId);
    
    boolean existsByCode(String code);
    
    boolean existsByName(String name);
    
    boolean existsByNameAndIdNot(String name, Long id);
}
