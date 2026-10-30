package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** Um foco de Pomodoro concluido. */
@Entity
@Table(name = "sessoes_pomodoro")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessaoPomodoro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id")
    private Materia materia;

    @Column(nullable = false)
    private Integer minutos;

    @Column(nullable = false)
    private LocalDateTime concluidaEm;
}
