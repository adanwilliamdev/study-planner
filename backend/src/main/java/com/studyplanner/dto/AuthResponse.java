package com.studyplanner.dto;

public record AuthResponse(String token, String tipo, String nome, String email) {
    public static AuthResponse bearer(String token, String nome, String email) {
        return new AuthResponse(token, "Bearer", nome, email);
    }
}
