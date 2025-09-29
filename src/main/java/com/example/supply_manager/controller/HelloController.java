package com.example.supply_manager.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HelloController {

    @GetMapping("/")
    public String home() {
        return "index.html";
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello, World!";
    }
}
