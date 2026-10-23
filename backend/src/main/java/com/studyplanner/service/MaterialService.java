package com.studyplanner.service;

import com.studyplanner.entity.*;
import com.studyplanner.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MaterialService {

    @Autowired private MaterialRepository materialRepository;
    @Autowired private MateriaRepository materiaRepository;

    public List<MaterialEstudo> listarPorMateria(Long materiaId) {
        return materialRepository.findByMateriaId(materiaId);
    }

    public MaterialEstudo criar(MaterialEstudo material, Long materiaId) {
        Materia m = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new RuntimeException("Matéria não encontrada"));
        material.setMateria(m);
        return materialRepository.save(material);
    }

    public void deletar(Long id) { materialRepository.deleteById(id); }
}