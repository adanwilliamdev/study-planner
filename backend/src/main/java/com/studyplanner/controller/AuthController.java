package com.studyplanner.controller;

import com.studyplanner.dto.*;
import com.studyplanner.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody LoginRequest req) {
        try {
            String jwt = authService.login(req.getEmail(), req.getSenha());
            return ResponseEntity.ok(new AuthResponse(jwt));
        } catch (Exception ex) {
            return ResponseEntity.status(401).body("Credenciais inválidas");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            authService.registrar(req.getNome(), req.getEmail(), req.getSenha());
            return ResponseEntity.ok("Usuário registrado com sucesso!");
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}