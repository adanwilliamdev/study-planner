package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Um ciclo de foco (Pomodoro) concluido. Base do historico de produtividade. */
@Entity
@Table(name = "sessoes_foco",
        indexes = @Index(name = "idx_sessoes_foco_usuario_data", columnList = "usuario_id, data"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessaoFoco {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    /** Opcional; vira null se a materia for excluida (o historico e preservado). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id")
    private Materia materia;

    @Column(nullable = false)
    private int minutos;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private LocalDateTime registradaEm;
}
