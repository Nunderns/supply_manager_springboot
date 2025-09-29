package com.example.supply_manager.service;

import com.example.supply_manager.entity.Product;
import com.example.supply_manager.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    public List<Product> findAll() {
        return productRepository.findAll();
    }
    
    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }
    
    public Optional<Product> findByCode(String code) {
        return productRepository.findByCode(code);
    }
    
    public List<Product> findByNameContaining(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }
    
    public List<Product> findByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }
    
    public List<Product> findBySupplier(Long supplierId) {
        return productRepository.findBySupplierId(supplierId);
    }
    
    public List<Product> findLowStockProducts() {
        return productRepository.findLowStockProducts();
    }
    
    public List<Product> findLowStockProductsByCategory(Long categoryId) {
        return productRepository.findLowStockProductsByCategory(categoryId);
    }
    
    public Product save(Product product) {
        if (product.getId() != null) {
            Optional<Product> existingProduct = productRepository.findById(product.getId());
            if (existingProduct.isPresent()) {
                Product existing = existingProduct.get();
                if (!existing.getCode().equals(product.getCode()) && productRepository.existsByCode(product.getCode())) {
                    throw new RuntimeException("Product code already exists");
                }
                if (!existing.getName().equals(product.getName()) && productRepository.existsByNameAndIdNot(product.getName(), product.getId())) {
                    throw new RuntimeException("Product name already exists");
                }
            }
        } else {
            if (productRepository.existsByCode(product.getCode())) {
                throw new RuntimeException("Product code already exists");
            }
            if (productRepository.existsByName(product.getName())) {
                throw new RuntimeException("Product name already exists");
            }
        }
        
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Product price must be positive");
        }
        
        if (product.getQuantity() == null || product.getQuantity() < 0) {
            throw new RuntimeException("Product quantity must be non-negative");
        }
        
        return productRepository.save(product);
    }
    
    public void deleteById(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }
    
    public Product updateStock(Long id, Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (quantity < 0) {
            throw new RuntimeException("Quantity must be non-negative");
        }
        
        product.setQuantity(quantity);
        return productRepository.save(product);
    }
    
    public Product addStock(Long id, Integer quantityToAdd) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (quantityToAdd < 0) {
            throw new RuntimeException("Quantity to add must be positive");
        }
        
        product.setQuantity(product.getQuantity() + quantityToAdd);
        return productRepository.save(product);
    }
    
    public Product removeStock(Long id, Integer quantityToRemove) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (quantityToRemove < 0) {
            throw new RuntimeException("Quantity to remove must be positive");
        }
        
        if (product.getQuantity() < quantityToRemove) {
            throw new RuntimeException("Insufficient stock");
        }
        
        product.setQuantity(product.getQuantity() - quantityToRemove);
        return productRepository.save(product);
    }
}
