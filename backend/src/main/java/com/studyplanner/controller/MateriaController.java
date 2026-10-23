package com.studyplanner.controller;

import com.studyplanner.entity.Materia;
import com.studyplanner.service.MateriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/materias")
public class MateriaController {

    @Autowired private MateriaService service;

    @GetMapping
    public List<Materia> listar(Authentication auth) {
        return service.listar(auth.getName());
    }

    @PostMapping
    public Materia criar(@RequestBody Materia m, Authentication auth) {
        return service.criar(m, auth.getName());
    }

    @PutMapping("/{id}")
    public Materia atualizar(@PathVariable Long id, @RequestBody Materia m) {
        return service.atualizar(id, m);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) { service.deletar(id); }
}