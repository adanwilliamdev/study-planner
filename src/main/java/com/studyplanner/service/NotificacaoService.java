package com.studyplanner.service;

import com.studyplanner.dto.NotificacaoResponse;
import com.studyplanner.entity.Notificacao;
import com.studyplanner.entity.Usuario;
import com.studyplanner.repository.NotificacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacaoService {

    private static final int DIAS_DE_HISTORICO = 60;

    private final NotificacaoRepository repository;
    private final UsuarioAtualService usuarioAtual;
    private final Clock clock;

    public NotificacaoService(NotificacaoRepository repository, UsuarioAtualService usuarioAtual, Clock clock) {
        this.repository = repository;
        this.usuarioAtual = usuarioAtual;
        this.clock = clock;
    }

    @Transactional
    public NotificacaoResponse criar(Usuario usuario, String mensagem) {
        Notificacao n = Notificacao.builder()
                .usuario(usuario)
                .mensagem(mensagem)
                .criadaEm(LocalDateTime.now(clock))
                .build();
        return NotificacaoResponse.de(repository.save(n));
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponse> recentes(String email) {
        return repository.findTop30ByUsuarioIdOrderByCriadaEmDescIdDesc(usuarioAtual.obter(email).getId())
                .stream().map(NotificacaoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public long naoLidas(String email) {
        return repository.countByUsuarioIdAndLidaFalse(usuarioAtual.obter(email).getId());
    }

    @Transactional
    public void marcarTodasComoLidas(String email) {
        repository.marcarTodasComoLidas(usuarioAtual.obter(email).getId());
    }

    /** Descarta notificacoes antigas para a tabela nao crescer sem limite. */
    @Transactional
    public int limparAntigas() {
        return repository.apagarAnterioresA(LocalDateTime.now(clock).minusDays(DIAS_DE_HISTORICO));
    }
}
