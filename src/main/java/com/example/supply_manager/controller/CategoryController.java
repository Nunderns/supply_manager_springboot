package com.example.supply_manager.controller;

import com.example.supply_manager.entity.Category;
import com.example.supply_manager.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.findAll();
        return ResponseEntity.ok(categories);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<Category> getCategoryByName(@PathVariable String name) {
        return categoryService.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Category>> searchCategories(@RequestParam String name) {
        List<Category> categories = categoryService.findByNameContaining(name);
        return ResponseEntity.ok(categories);
    }
    
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        try {
            Category savedCategory = categoryService.save(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        try {
            category.setId(id);
            Category updatedCategory = categoryService.save(category);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
