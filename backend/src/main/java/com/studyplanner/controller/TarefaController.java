package com.studyplanner.controller;

import com.studyplanner.dto.TarefaRequest;
import com.studyplanner.dto.TarefaResponse;
import com.studyplanner.service.TarefaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    private final TarefaService service;

    public TarefaController(TarefaService service) {
        this.service = service;
    }

    @GetMapping
    public List<TarefaResponse> listar(Authentication auth) {
        return service.listar(auth.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TarefaResponse criar(@Valid @RequestBody TarefaRequest req, Authentication auth) {
        return service.criar(req, auth.getName());
    }

    @PutMapping("/{id}")
    public TarefaResponse atualizar(@PathVariable Long id, @Valid @RequestBody TarefaRequest req,
                                    Authentication auth) {
        return service.atualizar(id, req, auth.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id, Authentication auth) {
        service.deletar(id, auth.getName());
    }
}
