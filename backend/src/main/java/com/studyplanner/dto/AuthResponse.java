package com.studyplanner.dto;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tipo = "Bearer";
    public AuthResponse(String token) { this.token = token; }
}