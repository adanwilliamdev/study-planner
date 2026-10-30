package com.studyplanner.repository;

import com.studyplanner.entity.Cronograma;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CronogramaRepository extends JpaRepository<Cronograma, Long> {
    List<Cronograma> findByMateriaUsuarioIdOrderByDiaDaSemanaAscHorarioInicioAsc(Long usuarioId);
    Optional<Cronograma> findByIdAndMateriaUsuarioId(Long id, Long usuarioId);
    void deleteByMateriaId(Long materiaId);
}
