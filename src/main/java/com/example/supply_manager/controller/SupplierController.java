package com.example.supply_manager.controller;

import com.example.supply_manager.entity.Supplier;
import com.example.supply_manager.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {
    
    @Autowired
    private SupplierService supplierService;
    
    @GetMapping
    public ResponseEntity<List<Supplier>> getAllSuppliers() {
        List<Supplier> suppliers = supplierService.findAll();
        return ResponseEntity.ok(suppliers);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Long id) {
        return supplierService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/name/{name}")
    public ResponseEntity<Supplier> getSupplierByName(@PathVariable String name) {
        return supplierService.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/tax/{taxId}")
    public ResponseEntity<Supplier> getSupplierByTaxId(@PathVariable String taxId) {
        return supplierService.findByTaxId(taxId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<Supplier> getSupplierByEmail(@PathVariable String email) {
        return supplierService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Supplier>> searchSuppliers(@RequestParam String name) {
        List<Supplier> suppliers = supplierService.findByNameContaining(name);
        return ResponseEntity.ok(suppliers);
    }
    
    @GetMapping("/search/email")
    public ResponseEntity<List<Supplier>> searchSuppliersByEmail(@RequestParam String email) {
        List<Supplier> suppliers = supplierService.findByEmailContaining(email);
        return ResponseEntity.ok(suppliers);
    }
    
    @PostMapping
    public ResponseEntity<?> createSupplier(@RequestBody Supplier supplier) {
        try {
            Supplier savedSupplier = supplierService.save(supplier);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedSupplier);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupplier(@PathVariable Long id, @RequestBody Supplier supplier) {
        try {
            supplier.setId(id);
            Supplier updatedSupplier = supplierService.save(supplier);
            return ResponseEntity.ok(updatedSupplier);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupplier(@PathVariable Long id) {
        try {
            supplierService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
