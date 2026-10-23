package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "materias")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Materia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String cor; // Hex color

    private Integer cargaHoraria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}