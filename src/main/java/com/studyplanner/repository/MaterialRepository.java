package com.studyplanner.repository;

import com.studyplanner.entity.MaterialEstudo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MaterialRepository extends JpaRepository<MaterialEstudo, Long> {
    List<MaterialEstudo> findByMateriaIdAndMateriaUsuarioId(Long materiaId, Long usuarioId);

    Optional<MaterialEstudo> findByIdAndMateriaUsuarioId(Long id, Long usuarioId);

    @Modifying(flushAutomatically = true)
    @Query("delete from MaterialEstudo m where m.materia.id = :materiaId")
    void apagarPorMateria(@Param("materiaId") Long materiaId);
}
