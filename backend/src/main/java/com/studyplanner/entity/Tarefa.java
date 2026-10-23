package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "tarefas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tarefa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    private String descricao;

    private LocalDate dataEntrega;

    @Enumerated(EnumType.STRING)
    private Prioridade prioridade; // ALTA, MEDIA, BAIXA

    @Enumerated(EnumType.STRING)
    private StatusTarefa status; // A_FAZER, EM_ANDAMENTO, CONCLUIDO

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id")
    private Materia materia;

    public enum Prioridade { ALTA, MEDIA, BAIXA }
    public enum StatusTarefa { A_FAZER, EM_ANDAMENTO, CONCLUIDO }
}