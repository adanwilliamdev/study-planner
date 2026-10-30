package com.studyplanner.service;

import com.studyplanner.dto.TarefaRequest;
import com.studyplanner.dto.TarefaResponse;
import com.studyplanner.entity.Materia;
import com.studyplanner.entity.Tarefa;
import com.studyplanner.entity.Tarefa.Prioridade;
import com.studyplanner.entity.Tarefa.StatusTarefa;
import com.studyplanner.entity.Usuario;
import com.studyplanner.exception.RecursoNaoEncontradoException;
import com.studyplanner.repository.MateriaRepository;
import com.studyplanner.repository.TarefaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TarefaServiceTest {

    private static final String EMAIL = "ana@exemplo.com";

    @Mock TarefaRepository tarefaRepository;
    @Mock MateriaRepository materiaRepository;
    @Mock UsuarioAtualService usuarioAtual;
    @InjectMocks TarefaService servico;

    private Usuario usuario;

    @BeforeEach
    void preparar() {
        usuario = Usuario.builder().id(1L).email(EMAIL).nome("Ana").senha("x").build();
        lenient().when(usuarioAtual.obter(EMAIL)).thenReturn(usuario);
        lenient().when(tarefaRepository.save(any(Tarefa.class))).thenAnswer(i -> i.getArgument(0));
    }

    private TarefaRequest pedido(Long materiaId, LocalDate prazo) {
        return new TarefaRequest("  Lista 3  ", null, prazo, null, null, materiaId);
    }

    @Test
    void criaTarefaComPadroesEMateriaDoUsuario() {
        Materia materia = Materia.builder().id(10L).nome("Cálculo").cor("#4A44E0").usuario(usuario).build();
        when(materiaRepository.findByIdAndUsuarioId(10L, 1L)).thenReturn(Optional.of(materia));

        TarefaResponse criada = servico.criar(pedido(10L, LocalDate.of(2026, 11, 5)), EMAIL);

        assertThat(criada.titulo()).isEqualTo("Lista 3");
        assertThat(criada.prioridade()).isEqualTo(Prioridade.MEDIA);
        assertThat(criada.status()).isEqualTo(StatusTarefa.A_FAZER);
        assertThat(criada.materia().id()).isEqualTo(10L);
    }

    @Test
    void naoAceitaMateriaDeOutroUsuario() {
        when(materiaRepository.findByIdAndUsuarioId(10L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servico.criar(pedido(10L, null), EMAIL))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        verify(tarefaRepository, never()).save(any());
    }

    @Test
    void novoPrazoPermiteNovoAlerta() {
        Tarefa tarefa = Tarefa.builder().id(5L).titulo("Lista 3").usuario(usuario)
                .dataEntrega(LocalDate.of(2026, 11, 5)).status(StatusTarefa.A_FAZER)
                .ultimaNotificacao(LocalDate.of(2026, 11, 4)).build();
        when(tarefaRepository.findByIdAndUsuarioId(5L, 1L)).thenReturn(Optional.of(tarefa));

        servico.atualizar(5L, pedido(null, LocalDate.of(2026, 11, 12)), EMAIL);

        assertThat(tarefa.getUltimaNotificacao()).isNull();
        assertThat(tarefa.getDataEntrega()).isEqualTo(LocalDate.of(2026, 11, 12));
    }

    @Test
    void mesmoPrazoMantemRegistroDoUltimoAlerta() {
        LocalDate prazo = LocalDate.of(2026, 11, 5);
        Tarefa tarefa = Tarefa.builder().id(5L).titulo("Lista 3").usuario(usuario).dataEntrega(prazo)
                .prioridade(Prioridade.MEDIA).status(StatusTarefa.A_FAZER).ultimaNotificacao(prazo).build();
        when(tarefaRepository.findByIdAndUsuarioId(5L, 1L)).thenReturn(Optional.of(tarefa));

        servico.atualizar(5L, pedido(null, prazo), EMAIL);

        assertThat(tarefa.getUltimaNotificacao()).isEqualTo(prazo);
    }

    @Test
    void alterarStatusDeTarefaAlheiaFalha() {
        when(tarefaRepository.findByIdAndUsuarioId(5L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servico.alterarStatus(5L, StatusTarefa.CONCLUIDO, EMAIL))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }
}
