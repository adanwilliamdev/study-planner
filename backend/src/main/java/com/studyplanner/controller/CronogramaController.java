package com.studyplanner.controller;

import com.studyplanner.entity.Cronograma;
import com.studyplanner.service.CronogramaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cronogramas")
public class CronogramaController {

    @Autowired private CronogramaService service;

    @GetMapping
    public List<Cronograma> listar(Authentication auth) {
        return service.listar(auth.getName());
    }

    @PostMapping
    public Cronograma criar(@RequestBody Cronograma c,
                            @RequestParam Long materiaId) {
        return service.criar(c, materiaId);
    }

    @PutMapping("/{id}/concluir")
    public Cronograma concluir(@PathVariable Long id) {
        return service.concluir(id);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) { service.deletar(id); }
}