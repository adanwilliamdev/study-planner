package com.studyplanner.controller;

import com.studyplanner.dto.MateriaRequest;
import com.studyplanner.dto.MateriaResponse;
import com.studyplanner.service.MateriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materias")
public class MateriaController {

    private final MateriaService service;

    public MateriaController(MateriaService service) {
        this.service = service;
    }

    @GetMapping
    public List<MateriaResponse> listar(Authentication auth) {
        return service.listar(auth.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MateriaResponse criar(@Valid @RequestBody MateriaRequest req, Authentication auth) {
        return service.criar(req, auth.getName());
    }

    @PutMapping("/{id}")
    public MateriaResponse atualizar(@PathVariable Long id, @Valid @RequestBody MateriaRequest req,
                                     Authentication auth) {
        return service.atualizar(id, req, auth.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id, Authentication auth) {
        service.deletar(id, auth.getName());
    }
}
