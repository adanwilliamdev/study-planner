package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;

@Entity
@Table(name = "cronogramas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cronograma {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DayOfWeek diaDaSemana;

    @Column(nullable = false)
    private LocalTime horarioInicio;

    @Column(nullable = false)
    private LocalTime horarioFim;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatusCronograma status = StatusCronograma.PENDENTE; // PENDENTE, CONCLUIDO

    /** Dia em que a sessao foi marcada como concluida. */
    private LocalDate concluidaEm;

    /**
     * O cronograma e semanal e se repete: uma sessao concluida em semanas anteriores
     * volta a aparecer como pendente na semana atual.
     */
    public StatusCronograma statusEfetivo(LocalDate hoje) {
        if (status != StatusCronograma.CONCLUIDO) return StatusCronograma.PENDENTE;
        LocalDate inicioDaSemana = hoje.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        return concluidaEm != null && !concluidaEm.isBefore(inicioDaSemana)
                ? StatusCronograma.CONCLUIDO : StatusCronograma.PENDENTE;
    }

    public enum StatusCronograma {
        PENDENTE, CONCLUIDO
    }
}