package com.studyplanner.service;

import com.studyplanner.dto.CronogramaRequest;
import com.studyplanner.dto.CronogramaResponse;
import com.studyplanner.entity.Cronograma;
import com.studyplanner.entity.Materia;
import com.studyplanner.entity.Usuario;
import com.studyplanner.exception.RecursoNaoEncontradoException;
import com.studyplanner.exception.RegraDeNegocioException;
import com.studyplanner.repository.CronogramaRepository;
import com.studyplanner.repository.MateriaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CronogramaServiceTest {

    private static final String EMAIL = "ana@exemplo.com";

    @Mock CronogramaRepository cronogramaRepository;
    @Mock MateriaRepository materiaRepository;
    @Mock UsuarioAtualService usuarioAtual;
    @InjectMocks CronogramaService servico;

    private Usuario usuario;
    private Materia calculo;

    @BeforeEach
    void preparar() {
        usuario = Usuario.builder().id(1L).email(EMAIL).nome("Ana").senha("x").build();
        calculo = Materia.builder().id(10L).nome("Cálculo").usuario(usuario).build();
        lenient().when(usuarioAtual.obter(EMAIL)).thenReturn(usuario);
        lenient().when(materiaRepository.findByIdAndUsuarioId(10L, 1L)).thenReturn(Optional.of(calculo));
        lenient().when(cronogramaRepository.save(any(Cronograma.class))).thenAnswer(i -> i.getArgument(0));
    }

    private Cronograma existente(int inicio, int fim) {
        return Cronograma.builder().id(99L).materia(calculo).diaDaSemana(DayOfWeek.MONDAY)
                .horarioInicio(LocalTime.of(inicio, 0)).horarioFim(LocalTime.of(fim, 0)).build();
    }

    private CronogramaRequest pedido(LocalTime inicio, LocalTime fim) {
        return new CronogramaRequest(10L, DayOfWeek.MONDAY, inicio, fim);
    }

    @Test
    void rejeitaTerminoAntesDoInicio() {
        assertThatThrownBy(() -> servico.criar(pedido(LocalTime.of(20, 0), LocalTime.of(19, 0)), EMAIL))
                .isInstanceOf(RegraDeNegocioException.class);
        verify(cronogramaRepository, never()).save(any());
    }

    @Test
    void rejeitaSessaoQueSobrepoeOutra() {
        when(cronogramaRepository.doUsuarioNoDia(1L, DayOfWeek.MONDAY)).thenReturn(List.of(existente(19, 20)));

        assertThatThrownBy(() -> servico.criar(pedido(LocalTime.of(19, 30), LocalTime.of(20, 30)), EMAIL))
                .isInstanceOf(RegraDeNegocioException.class)
                .hasMessageContaining("Conflito");
        verify(cronogramaRepository, never()).save(any());
    }

    @Test
    void permiteSessoesQueApenasSeEncostam() {
        when(cronogramaRepository.doUsuarioNoDia(1L, DayOfWeek.MONDAY)).thenReturn(List.of(existente(19, 20)));

        CronogramaResponse criada = servico.criar(pedido(LocalTime.of(20, 0), LocalTime.of(21, 0)), EMAIL);

        assertThat(criada.horarioInicio()).isEqualTo(LocalTime.of(20, 0));
        assertThat(criada.materia().id()).isEqualTo(10L);
    }

    @Test
    void naoUsaMateriaDeOutroUsuario() {
        when(materiaRepository.findByIdAndUsuarioId(10L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servico.criar(pedido(LocalTime.of(8, 0), LocalTime.of(9, 0)), EMAIL))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }
}
