package com.studyplanner.repository;

import com.studyplanner.entity.SessaoPomodoro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SessaoPomodoroRepository extends JpaRepository<SessaoPomodoro, Long> {
    List<SessaoPomodoro> findByUsuarioIdAndConcluidaEmGreaterThanEqual(Long usuarioId, LocalDateTime desde);
}
