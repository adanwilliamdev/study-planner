package com.studyplanner.repository;

import com.studyplanner.entity.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findTop30ByUsuarioIdOrderByCriadaEmDescIdDesc(Long usuarioId);

    long countByUsuarioIdAndLidaFalse(Long usuarioId);

    @Modifying
    @Query("update Notificacao n set n.lida = true where n.usuario.id = :usuarioId and n.lida = false")
    int marcarTodasComoLidas(@Param("usuarioId") Long usuarioId);

    @Modifying
    @Query("delete from Notificacao n where n.criadaEm < :limite")
    int apagarAnterioresA(@Param("limite") LocalDateTime limite);
}
