package com.example.supply_manager.controller;

import com.example.supply_manager.entity.Product;
import com.example.supply_manager.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.findAll();
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/code/{code}")
    public ResponseEntity<Product> getProductByCode(@PathVariable String code) {
        return productService.findByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String name) {
        List<Product> products = productService.findByNameContaining(name);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable Long categoryId) {
        List<Product> products = productService.findByCategory(categoryId);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<Product>> getProductsBySupplier(@PathVariable Long supplierId) {
        List<Product> products = productService.findBySupplier(supplierId);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts() {
        List<Product> products = productService.findLowStockProducts();
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/low-stock/category/{categoryId}")
    public ResponseEntity<List<Product>> getLowStockProductsByCategory(@PathVariable Long categoryId) {
        List<Product> products = productService.findLowStockProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }
    
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            Product savedProduct = productService.save(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            product.setId(id);
            Product updatedProduct = productService.save(product);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        try {
            Product product = productService.updateStock(id, quantity);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/stock/add")
    public ResponseEntity<?> addStock(@PathVariable Long id, @RequestParam Integer quantity) {
        try {
            Product product = productService.addStock(id, quantity);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/stock/remove")
    public ResponseEntity<?> removeStock(@PathVariable Long id, @RequestParam Integer quantity) {
        try {
            Product product = productService.removeStock(id, quantity);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
