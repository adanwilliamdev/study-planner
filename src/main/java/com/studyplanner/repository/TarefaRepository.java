package com.studyplanner.repository;

import com.studyplanner.entity.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    /** Abertas primeiro, depois por prazo (sem prazo por ultimo). A materia vem junto: sem N+1. */
    @Query("select t from Tarefa t left join fetch t.materia " +
            "where t.usuario.id = :usuarioId " +
            "order by case when t.status = :concluido then 1 else 0 end, " +
            "t.dataEntrega asc nulls last, t.id")
    List<Tarefa> listarOrdenadas(@Param("usuarioId") Long usuarioId,
                                 @Param("concluido") Tarefa.StatusTarefa concluido);

    Optional<Tarefa> findByIdAndUsuarioId(Long id, Long usuarioId);

    @Modifying(flushAutomatically = true)
    @Query("delete from Tarefa t where t.materia.id = :materiaId")
    void apagarPorMateria(@Param("materiaId") Long materiaId);

    /** Tarefas abertas que vencem entre hoje e amanha e ainda nao foram avisadas hoje. */
    @Query("select t from Tarefa t join fetch t.usuario " +
            "where t.dataEntrega between :hoje and :amanha " +
            "and t.status <> :statusConcluido " +
            "and (t.ultimaNotificacao is null or t.ultimaNotificacao < :hoje)")
    List<Tarefa> findTarefasVencendo(@Param("hoje") LocalDate hoje,
                                     @Param("amanha") LocalDate amanha,
                                     @Param("statusConcluido") Tarefa.StatusTarefa statusConcluido);
}
