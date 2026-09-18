package com.springboot.restapi.controller;

import org.springframework.web.bind.annotation.*;
import com.springboot.restapi.model.Student;

@RestController
public class HelloControllerClass {

    @GetMapping("/hello")
    public String hello() {
        return "Hello Chandni! "
        		+ "API Working Successfully";
    }

    @PostMapping("/student")
    public Student createStudent(@RequestBody Student student) {
        return student;
    }
}