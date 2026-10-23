package com.studyplanner.controller;

import com.studyplanner.entity.Tarefa;
import com.studyplanner.service.TarefaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    @Autowired private TarefaService service;

    @GetMapping
    public List<Tarefa> listar(Authentication auth) {
        return service.listar(auth.getName());
    }

    @PostMapping
    public Tarefa criar(@RequestBody Tarefa t,
                        @RequestParam(required = false) Long materiaId) {
        return service.criar(t, materiaId);
    }

    @PutMapping("/{id}")
    public Tarefa atualizar(@PathVariable Long id,
                            @RequestBody Tarefa t,
                            @RequestParam(required = false) Long materiaId) {
        return service.atualizar(id, t, materiaId);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) { service.deletar(id); }
}