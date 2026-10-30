package com.studyplanner.controller;

import com.studyplanner.dto.MaterialRequest;
import com.studyplanner.dto.MaterialResponse;
import com.studyplanner.service.MaterialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materiais")
public class MaterialController {

    private final MaterialService service;

    public MaterialController(MaterialService service) {
        this.service = service;
    }

    @GetMapping("/materia/{materiaId}")
    public List<MaterialResponse> listar(@PathVariable Long materiaId, Authentication auth) {
        return service.listarPorMateria(materiaId, auth.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MaterialResponse criar(@Valid @RequestBody MaterialRequest req, Authentication auth) {
        return service.criar(req, auth.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id, Authentication auth) {
        service.deletar(id, auth.getName());
    }
}
