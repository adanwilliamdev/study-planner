package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.DayOfWeek;
import java.time.LocalTime;

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

    public enum StatusCronograma {
        PENDENTE, CONCLUIDO
    }
}