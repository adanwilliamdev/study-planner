package com.studyplanner.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notificacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 300)
    private String mensagem;

    @Column(nullable = false)
    private LocalDateTime criadaEm;

    @Column(nullable = false)
    @Builder.Default
    private boolean lida = false;
}
