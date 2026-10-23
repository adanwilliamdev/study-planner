package com.studyplanner.repository;

import com.studyplanner.entity.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    List<Tarefa> findByUsuarioId(Long usuarioId);

    Optional<Tarefa> findByIdAndUsuarioId(Long id, Long usuarioId);

    void deleteByMateriaId(Long materiaId);

    /** Tarefas abertas que vencem entre hoje e amanha e ainda nao foram avisadas hoje. */
    @Query("SELECT t FROM Tarefa t JOIN FETCH t.usuario " +
            "WHERE t.dataEntrega BETWEEN :hoje AND :amanha " +
            "AND t.status <> :statusConcluido " +
            "AND (t.ultimaNotificacao IS NULL OR t.ultimaNotificacao < :hoje)")
    List<Tarefa> findTarefasVencendo(@Param("hoje") LocalDate hoje,
                                     @Param("amanha") LocalDate amanha,
                                     @Param("statusConcluido") Tarefa.StatusTarefa statusConcluido);
}
