package com.studyplanner.repository;
import com.studyplanner.entity.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MateriaRepository extends JpaRepository<Materia, Long> {
    List<Materia> findByUsuarioId(Long usuarioId);
}