package com.example.supply_manager.repository;

import com.example.supply_manager.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    
    Optional<Supplier> findByName(String name);
    
    Optional<Supplier> findByTaxId(String taxId);
    
    Optional<Supplier> findByEmail(String email);
    
    List<Supplier> findByNameContainingIgnoreCase(String name);
    
    List<Supplier> findByEmailContainingIgnoreCase(String email);
    
    boolean existsByName(String name);
    
    boolean existsByTaxId(String taxId);
    
    boolean existsByEmail(String email);
    
    boolean existsByNameAndIdNot(String name, Long id);
    
    boolean existsByTaxIdAndIdNot(String taxId, Long id);
    
    boolean existsByEmailAndIdNot(String email, Long id);
}
