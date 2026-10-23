package com.studyplanner.repository;
import com.studyplanner.entity.MaterialEstudo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaterialRepository extends JpaRepository<MaterialEstudo, Long> {
    List<MaterialEstudo> findByMateriaUsuarioId(Long usuarioId);
    List<MaterialEstudo> findByMateriaId(Long materiaId);
}