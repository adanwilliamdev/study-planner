package com.studyplanner.repository;

import com.studyplanner.entity.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MateriaRepository extends JpaRepository<Materia, Long> {
    List<Materia> findByUsuarioIdOrderByNomeAsc(Long usuarioId);
    Optional<Materia> findByIdAndUsuarioId(Long id, Long usuarioId);
}
