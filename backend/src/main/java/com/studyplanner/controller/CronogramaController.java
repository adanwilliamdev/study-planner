package com.studyplanner.controller;

import com.studyplanner.dto.CronogramaRequest;
import com.studyplanner.dto.CronogramaResponse;
import com.studyplanner.service.CronogramaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cronogramas")
public class CronogramaController {

    private final CronogramaService service;

    public CronogramaController(CronogramaService service) {
        this.service = service;
    }

    @GetMapping
    public List<CronogramaResponse> listar(Authentication auth) {
        return service.listar(auth.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CronogramaResponse criar(@Valid @RequestBody CronogramaRequest req, Authentication auth) {
        return service.criar(req, auth.getName());
    }

    @PutMapping("/{id}/concluir")
    public CronogramaResponse concluir(@PathVariable Long id, Authentication auth) {
        return service.concluir(id, auth.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id, Authentication auth) {
        service.deletar(id, auth.getName());
    }
}
