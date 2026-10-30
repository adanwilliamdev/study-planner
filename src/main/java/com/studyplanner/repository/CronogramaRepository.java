package com.studyplanner.repository;

import com.studyplanner.entity.Cronograma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

public interface CronogramaRepository extends JpaRepository<Cronograma, Long> {

    @Query("select c from Cronograma c join fetch c.materia m where m.usuario.id = :usuarioId")
    List<Cronograma> listarDoUsuario(@Param("usuarioId") Long usuarioId);

    @Query("select c from Cronograma c where c.materia.usuario.id = :usuarioId and c.diaDaSemana = :dia")
    List<Cronograma> doUsuarioNoDia(@Param("usuarioId") Long usuarioId, @Param("dia") DayOfWeek dia);

    Optional<Cronograma> findByIdAndMateriaUsuarioId(Long id, Long usuarioId);

    @Modifying(flushAutomatically = true)
    @Query("delete from Cronograma c where c.materia.id = :materiaId")
    void apagarPorMateria(@Param("materiaId") Long materiaId);

    /** Virada de semana: todas as sessoes voltam a ficar pendentes. */
    @Modifying
    @Query("update Cronograma c set c.status = com.studyplanner.entity.Cronograma.StatusCronograma.PENDENTE " +
            "where c.status <> com.studyplanner.entity.Cronograma.StatusCronograma.PENDENTE")
    int reiniciarSemana();
}
