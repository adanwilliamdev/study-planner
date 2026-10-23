// TarefaRepository.java
package com.studyplanner.repository;
import com.studyplanner.entity.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByMateriaUsuarioId(Long usuarioId);

    @Query("SELECT t FROM Tarefa t WHERE t.dataEntrega BETWEEN :hoje AND :amanha")
    List<Tarefa> findTarefasVencendo(@Param("hoje") LocalDate hoje, @Param("amanha") LocalDate amanha);
}