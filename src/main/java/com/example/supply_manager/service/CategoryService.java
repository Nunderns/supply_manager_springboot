package com.example.supply_manager.service;

import com.example.supply_manager.entity.Category;
import com.example.supply_manager.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }
    
    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }
    
    public Optional<Category> findByName(String name) {
        return categoryRepository.findByName(name);
    }
    
    public List<Category> findByNameContaining(String name) {
        return categoryRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Category save(Category category) {
        if (category.getId() != null) {
            Optional<Category> existingCategory = categoryRepository.findById(category.getId());
            if (existingCategory.isPresent()) {
                Category existing = existingCategory.get();
                if (!existing.getName().equals(category.getName()) && categoryRepository.existsByName(category.getName())) {
                    throw new RuntimeException("Category name already exists");
                }
            }
        } else {
            if (categoryRepository.existsByName(category.getName())) {
                throw new RuntimeException("Category name already exists");
            }
        }
        
        return categoryRepository.save(category);
    }
    
    public void deleteById(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found");
        }
        categoryRepository.deleteById(id);
    }
}
