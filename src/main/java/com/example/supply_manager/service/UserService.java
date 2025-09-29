package com.example.supply_manager.service;

import com.example.supply_manager.entity.Role;
import com.example.supply_manager.entity.User;
import com.example.supply_manager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public User save(User user) {
        if (user.getId() != null) {
            Optional<User> existingUser = userRepository.findById(user.getId());
            if (existingUser.isPresent()) {
                User existing = existingUser.get();
                if (!existing.getUsername().equals(user.getUsername()) && userRepository.existsByUsername(user.getUsername())) {
                    throw new RuntimeException("Username already exists");
                }
                if (!existing.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(user.getEmail())) {
                    throw new RuntimeException("Email already exists");
                }
                if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                    user.setPassword(passwordEncoder.encode(user.getPassword()));
                } else {
                    user.setPassword(existing.getPassword());
                }
            }
        } else {
            if (userRepository.existsByUsername(user.getUsername())) {
                throw new RuntimeException("Username already exists");
            }
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                throw new RuntimeException("Password is required");
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            if (user.getRoles() == null || user.getRoles().isEmpty()) {
                user.setRoles(Set.of(Role.USER));
            }
        }
        
        return userRepository.save(user);
    }
    
    public void deleteById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }
    
    public User createDefaultAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setEmail("admin@supplymanager.com");
            admin.setFullName("System Administrator");
            admin.setRoles(Set.of(Role.ADMIN));
            return save(admin);
        }
        return null;
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getIsActive(),
                true, true, true,
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                        .collect(Collectors.toList())
        );
    }
}
