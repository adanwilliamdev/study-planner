package com.studyplanner.service;

import com.studyplanner.dto.FocoRequest;
import com.studyplanner.dto.FocoResponse;
import com.studyplanner.entity.Materia;
import com.studyplanner.entity.SessaoFoco;
import com.studyplanner.entity.Usuario;
import com.studyplanner.exception.RecursoNaoEncontradoException;
import com.studyplanner.repository.MateriaRepository;
import com.studyplanner.repository.SessaoFocoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class FocoService {

    private final SessaoFocoRepository sessaoFocoRepository;
    private final MateriaRepository materiaRepository;
    private final UsuarioAtualService usuarioAtual;

    public FocoService(SessaoFocoRepository sessaoFocoRepository, MateriaRepository materiaRepository,
                       UsuarioAtualService usuarioAtual) {
        this.sessaoFocoRepository = sessaoFocoRepository;
        this.materiaRepository = materiaRepository;
        this.usuarioAtual = usuarioAtual;
    }

    @Transactional
    public FocoResponse registrar(FocoRequest req, String email) {
        Usuario u = usuarioAtual.obter(email);
        Materia materia = null;
        if (req.materiaId() != null) {
            materia = materiaRepository.findByIdAndUsuarioId(req.materiaId(), u.getId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada"));
        }
        SessaoFoco s = SessaoFoco.builder()
                .usuario(u).materia(materia).minutos(req.minutos())
                .data(LocalDate.now()).registradaEm(LocalDateTime.now())
                .build();
        return FocoResponse.de(sessaoFocoRepository.save(s));
    }
}
