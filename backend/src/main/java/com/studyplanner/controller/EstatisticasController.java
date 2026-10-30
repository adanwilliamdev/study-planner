package com.studyplanner.controller;

import com.studyplanner.dto.EstatisticasResponse;
import com.studyplanner.service.EstatisticasService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estatisticas")
public class EstatisticasController {

    private final EstatisticasService service;

    public EstatisticasController(EstatisticasService service) {
        this.service = service;
    }

    /** dias: tamanho do periodo (1 a 90; padrao 7). */
    @GetMapping
    public EstatisticasResponse obter(@RequestParam(defaultValue = "7") int dias, Authentication auth) {
        return service.obter(auth.getName(), dias);
    }
}
