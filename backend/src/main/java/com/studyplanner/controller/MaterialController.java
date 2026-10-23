package com.studyplanner.controller;

import com.studyplanner.entity.MaterialEstudo;
import com.studyplanner.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/materiais")
public class MaterialController {

    @Autowired private MaterialService service;

    @GetMapping("/materia/{materiaId}")
    public List<MaterialEstudo> listar(@PathVariable Long materiaId) {
        return service.listarPorMateria(materiaId);
    }

    @PostMapping
    public MaterialEstudo criar(@RequestBody MaterialEstudo m,
                                @RequestParam Long materiaId) {
        return service.criar(m, materiaId);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) { service.deletar(id); }
}