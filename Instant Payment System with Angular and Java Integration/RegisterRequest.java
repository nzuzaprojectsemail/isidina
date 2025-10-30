package com.example.demo.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String idPassport;
    private String physicalAddress;
    private String cellNumber;
}

