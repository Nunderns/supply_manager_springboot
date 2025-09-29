package com.example.supply_manager.service;

import com.example.supply_manager.entity.Supplier;
import com.example.supply_manager.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SupplierService {
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    public List<Supplier> findAll() {
        return supplierRepository.findAll();
    }
    
    public Optional<Supplier> findById(Long id) {
        return supplierRepository.findById(id);
    }
    
    public Optional<Supplier> findByName(String name) {
        return supplierRepository.findByName(name);
    }
    
    public Optional<Supplier> findByTaxId(String taxId) {
        return supplierRepository.findByTaxId(taxId);
    }
    
    public Optional<Supplier> findByEmail(String email) {
        return supplierRepository.findByEmail(email);
    }
    
    public List<Supplier> findByNameContaining(String name) {
        return supplierRepository.findByNameContainingIgnoreCase(name);
    }
    
    public List<Supplier> findByEmailContaining(String email) {
        return supplierRepository.findByEmailContainingIgnoreCase(email);
    }
    
    public Supplier save(Supplier supplier) {
        if (supplier.getId() != null) {
            Optional<Supplier> existingSupplier = supplierRepository.findById(supplier.getId());
            if (existingSupplier.isPresent()) {
                Supplier existing = existingSupplier.get();
                if (!existing.getName().equals(supplier.getName()) && supplierRepository.existsByName(supplier.getName())) {
                    throw new RuntimeException("Supplier name already exists");
                }
                if (!existing.getTaxId().equals(supplier.getTaxId()) && supplierRepository.existsByTaxId(supplier.getTaxId())) {
                    throw new RuntimeException("Supplier tax ID already exists");
                }
                if (!existing.getEmail().equals(supplier.getEmail()) && supplierRepository.existsByEmail(supplier.getEmail())) {
                    throw new RuntimeException("Supplier email already exists");
                }
            }
        } else {
            if (supplierRepository.existsByName(supplier.getName())) {
                throw new RuntimeException("Supplier name already exists");
            }
            if (supplierRepository.existsByTaxId(supplier.getTaxId())) {
                throw new RuntimeException("Supplier tax ID already exists");
            }
            if (supplierRepository.existsByEmail(supplier.getEmail())) {
                throw new RuntimeException("Supplier email already exists");
            }
        }
        
        return supplierRepository.save(supplier);
    }
    
    public void deleteById(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new RuntimeException("Supplier not found");
        }
        supplierRepository.deleteById(id);
    }
}
