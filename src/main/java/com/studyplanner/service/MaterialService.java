package com.studyplanner.service;

import com.studyplanner.dto.MaterialRequest;
import com.studyplanner.dto.MaterialResponse;
import com.studyplanner.entity.Materia;
import com.studyplanner.entity.MaterialEstudo;
import com.studyplanner.exception.RecursoNaoEncontradoException;
import com.studyplanner.exception.RegraDeNegocioException;
import com.studyplanner.repository.MateriaRepository;
import com.studyplanner.repository.MaterialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final MateriaRepository materiaRepository;
    private final UsuarioAtualService usuarioAtual;

    public MaterialService(MaterialRepository materialRepository, MateriaRepository materiaRepository,
                           UsuarioAtualService usuarioAtual) {
        this.materialRepository = materialRepository;
        this.materiaRepository = materiaRepository;
        this.usuarioAtual = usuarioAtual;
    }

    @Transactional(readOnly = true)
    public List<MaterialResponse> listarPorMateria(Long materiaId, String email) {
        Long usuarioId = usuarioAtual.obter(email).getId();
        materiaRepository.findByIdAndUsuarioId(materiaId, usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada"));
        return materialRepository.findByMateriaIdAndMateriaUsuarioId(materiaId, usuarioId)
                .stream().map(MaterialResponse::de).toList();
    }

    @Transactional
    public MaterialResponse criar(MaterialRequest req, String email) {
        Long usuarioId = usuarioAtual.obter(email).getId();
        Materia m = materiaRepository.findByIdAndUsuarioId(req.materiaId(), usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Matéria não encontrada"));

        String conteudo = req.urlOuCaminho() == null ? "" : req.urlOuCaminho().trim();
        if (req.tipo() == MaterialEstudo.TipoMaterial.LINK) {
            // bloqueia esquemas perigosos (javascript:, data:) que seriam renderizados como link
            String baixo = conteudo.toLowerCase();
            if (!(baixo.startsWith("http://") || baixo.startsWith("https://"))) {
                throw new RegraDeNegocioException("O link deve começar com http:// ou https://");
            }
        }
        MaterialEstudo material = MaterialEstudo.builder()
                .titulo(req.titulo().trim())
                .tipo(req.tipo())
                .urlOuCaminho(conteudo.isEmpty() ? null : conteudo)
                .materia(m)
                .build();
        return MaterialResponse.de(materialRepository.save(material));
    }

    @Transactional
    public void deletar(Long id, String email) {
        MaterialEstudo m = materialRepository.findByIdAndMateriaUsuarioId(id, usuarioAtual.obter(email).getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Material não encontrado"));
        materialRepository.delete(m);
    }
}
