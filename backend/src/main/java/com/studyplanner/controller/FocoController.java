package com.studyplanner.controller;

import com.studyplanner.dto.FocoRequest;
import com.studyplanner.dto.FocoResponse;
import com.studyplanner.service.FocoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/foco")
public class FocoController {

    private final FocoService service;

    public FocoController(FocoService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FocoResponse registrar(@Valid @RequestBody FocoRequest req, Authentication auth) {
        return service.registrar(req, auth.getName());
    }
}
