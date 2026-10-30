package com.studyplanner.repository;

import com.studyplanner.entity.SessaoFoco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SessaoFocoRepository extends JpaRepository<SessaoFoco, Long> {

    @Query("SELECT s FROM SessaoFoco s LEFT JOIN FETCH s.materia " +
            "WHERE s.usuario.id = :usuarioId AND s.data >= :desde")
    List<SessaoFoco> findDesde(@Param("usuarioId") Long usuarioId, @Param("desde") LocalDate desde);

    @Query("SELECT COALESCE(SUM(s.minutos), 0) FROM SessaoFoco s WHERE s.usuario.id = :usuarioId")
    long totalMinutos(@Param("usuarioId") Long usuarioId);

    /** Ao excluir uma materia o historico de foco e mantido, apenas sem materia. */
    @Modifying(flushAutomatically = true)
    @Query("UPDATE SessaoFoco s SET s.materia = null WHERE s.materia.id = :materiaId")
    void desvincularMateria(@Param("materiaId") Long materiaId);
}
