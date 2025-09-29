package com.example.supply_manager.config;

import com.example.supply_manager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Bean
    @SuppressWarnings("deprecation")
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/users/init-admin").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/").permitAll()
                .requestMatchers("/hello").permitAll()
                .requestMatchers("/index.html").permitAll()
                .requestMatchers("/products.html").permitAll()
                .requestMatchers("/categories.html").permitAll()
                .requestMatchers("/suppliers.html").permitAll()
                .requestMatchers("/users.html").permitAll()
                .requestMatchers("/*.html").permitAll()
                .requestMatchers("/static/**").permitAll()
                .requestMatchers("/css/**").permitAll()
                .requestMatchers("/js/**").permitAll()
                .requestMatchers("/images/**").permitAll()
                .requestMatchers("/api/products/**").permitAll()
                .requestMatchers("/api/categories/**").permitAll()
                .requestMatchers("/api/suppliers/**").permitAll()
                .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "USER")
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.disable());
        
        http.authenticationProvider(authenticationProvider());
        
        return http.build();
    }
}
