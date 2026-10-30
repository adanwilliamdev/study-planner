package com.studyplanner.repository;

import com.studyplanner.entity.MaterialEstudo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MaterialRepository extends JpaRepository<MaterialEstudo, Long> {
    List<MaterialEstudo> findByMateriaIdAndMateriaUsuarioId(Long materiaId, Long usuarioId);
    Optional<MaterialEstudo> findByIdAndMateriaUsuarioId(Long id, Long usuarioId);
    void deleteByMateriaId(Long materiaId);
}
