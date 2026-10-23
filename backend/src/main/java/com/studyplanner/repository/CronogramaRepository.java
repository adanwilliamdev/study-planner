package com.studyplanner.repository;
import com.studyplanner.entity.Cronograma;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CronogramaRepository extends JpaRepository<Cronograma, Long> {
    List<Cronograma> findByMateriaUsuarioId(Long usuarioId);
}