package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "materiais_estudo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MaterialEstudo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Enumerated(EnumType.STRING)
    private TipoMaterial tipo; // PDF, LINK, RESUMO

    private String urlOuCaminho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;

    public enum TipoMaterial { PDF, LINK, RESUMO }
}