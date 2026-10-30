package com.studyplanner.ui.views;

import com.studyplanner.dto.MateriaResponse;
import com.studyplanner.dto.MateriaResumo;
import com.studyplanner.dto.TarefaRequest;
import com.studyplanner.dto.TarefaResponse;
import com.studyplanner.entity.Tarefa.Prioridade;
import com.studyplanner.entity.Tarefa.StatusTarefa;
import com.studyplanner.service.MateriaService;
import com.studyplanner.service.TarefaService;
import com.studyplanner.ui.MainLayout;
import com.studyplanner.ui.util.Chips;
import com.studyplanner.ui.util.Confirmar;
import com.studyplanner.ui.util.Datas;
import com.studyplanner.ui.util.Rotulos;
import com.studyplanner.ui.util.Toasts;
import com.studyplanner.ui.util.ValidadorForm;
import com.studyplanner.ui.util.Vazio;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.checkbox.Checkbox;
import com.vaadin.flow.component.datepicker.DatePicker;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.dnd.DragSource;
import com.vaadin.flow.component.dnd.DropTarget;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.grid.GridVariant;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.tabs.Tab;
import com.vaadin.flow.component.tabs.Tabs;
import com.vaadin.flow.component.textfield.TextArea;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.data.provider.ListDataProvider;
import com.vaadin.flow.data.value.ValueChangeMode;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.spring.security.AuthenticationContext;
import jakarta.annotation.security.PermitAll;

import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Tarefas em duas visoes sobre os mesmos dados: lista (tabela) e quadro (arrastar entre colunas). */
@Route(value = "tarefas", layout = MainLayout.class)
@PageTitle("Tarefas")
@PermitAll
public class TarefasView extends Div {

    private final String email;
    private final TarefaService tarefas;
    private final MateriaService materias;
    private final ValidadorForm validador;
    private final Clock relogio;

    private final List<TarefaResponse> todas = new ArrayList<>();
    private final ListDataProvider<TarefaResponse> provedor = new ListDataProvider<>(new ArrayList<>());
    private final Grid<TarefaResponse> grade = new Grid<>();
    private final Div quadro = new Div();
    private final Div lista = new Div();

    private final TextField busca = new TextField();
    private final Select<StatusTarefa> filtroStatus = new Select<>();
    private final Select<MateriaResumo> filtroMateria = new Select<>();

    public TarefasView(AuthenticationContext autenticacao, TarefaService tarefas, MateriaService materias,
                       ValidadorForm validador, Clock relogio) {
        this.email = autenticacao.getPrincipalName().orElseThrow();
        this.tarefas = tarefas;
        this.materias = materias;
        this.validador = validador;
        this.relogio = relogio;
        addClassName("pagina");

        add(criarBarra(), criarAbas());
        recarregar();
    }

    // ---------- barra de filtros ----------

    private Div criarBarra() {
        busca.setPlaceholder("Buscar tarefa");
        busca.setPrefixComponent(VaadinIcon.SEARCH.create());
        busca.setClearButtonVisible(true);
        busca.setValueChangeMode(ValueChangeMode.LAZY);
        busca.addValueChangeListener(e -> aplicarFiltro());

        filtroStatus.setPlaceholder("Todos os status");
        filtroStatus.setEmptySelectionAllowed(true);
        filtroStatus.setEmptySelectionCaption("Todos os status");
        filtroStatus.setItems(StatusTarefa.values());
        filtroStatus.setItemLabelGenerator(Rotulos::status);
        filtroStatus.addValueChangeListener(e -> aplicarFiltro());

        List<MateriaResumo> itens = materias.listar(email).stream().map(MateriaResponse::resumo).toList();
        filtroMateria.setEmptySelectionAllowed(true);
        filtroMateria.setEmptySelectionCaption("Todas as matérias");
        filtroMateria.setItems(itens);
        filtroMateria.setItemLabelGenerator(MateriaResumo::nome);
        filtroMateria.addValueChangeListener(e -> aplicarFiltro());

        Button nova = new Button("Nova tarefa", VaadinIcon.PLUS.create(), e -> abrirFormulario(null));
        nova.addThemeVariants(ButtonVariant.LUMO_PRIMARY);

        Div filtros = new Div(busca, filtroStatus, filtroMateria);
        filtros.addClassName("filtros");
        Div barra = new Div(filtros, nova);
        barra.addClassName("pagina__topo");
        return barra;
    }

    private Div criarAbas() {
        Tab abaLista = new Tab(VaadinIcon.LIST.create(), new Span("Lista"));
        Tab abaQuadro = new Tab(VaadinIcon.GRID_BIG.create(), new Span("Quadro"));
        Tabs abas = new Tabs(abaLista, abaQuadro);

        configurarGrade();
        lista.addClassName("tarefas__lista");
        lista.add(grade);
        quadro.addClassName("quadro");
        quadro.setVisible(false);

        abas.addSelectedChangeListener(e -> {
            boolean emLista = e.getSelectedTab() == abaLista;
            lista.setVisible(emLista);
            quadro.setVisible(!emLista);
        });
        Div conteudo = new Div(abas, lista, quadro);
        conteudo.addClassName("tarefas__conteudo");
        return conteudo;
    }

    // ---------- lista ----------

    private void configurarGrade() {
        grade.addThemeVariants(GridVariant.LUMO_NO_BORDER, GridVariant.LUMO_ROW_STRIPES);
        grade.setItems(provedor);
        grade.setHeight("min(70vh, 640px)");

        grade.addComponentColumn(t -> {
            Checkbox feita = new Checkbox(t.status() == StatusTarefa.CONCLUIDO);
            feita.setAriaLabel("Concluir " + t.titulo());
            feita.addValueChangeListener(e -> {
                if (e.isFromClient()) {
                    tarefas.alterarStatus(t.id(), e.getValue() ? StatusTarefa.CONCLUIDO : StatusTarefa.A_FAZER, email);
                    recarregar();
                }
            });
            return feita;
        }).setHeader("").setWidth("56px").setFlexGrow(0);

        grade.addComponentColumn(t -> {
            Span titulo = new Span(t.titulo());
            titulo.addClassName("tarefa__titulo");
            if (t.status() == StatusTarefa.CONCLUIDO) {
                titulo.addClassName("tarefa__titulo--feita");
            }
            Div celula = new Div(titulo);
            celula.addClassName("tarefa__celula");
            if (t.descricao() != null) {
                Span desc = new Span(t.descricao());
                desc.addClassNames("texto-mudo", "tarefa__descricao");
                celula.add(desc);
            }
            return celula;
        }).setHeader("Tarefa").setFlexGrow(3).setMinWidth("220px");

        grade.addComponentColumn(t -> t.materia() == null ? new Span("—") : Chips.materia(t.materia()))
                .setHeader("Matéria").setFlexGrow(1).setMinWidth("140px");

        grade.addComponentColumn(t -> {
            var prazo = Datas.prazo(t.dataEntrega(), LocalDate.now(relogio));
            if (prazo == null) {
                return new Span("—");
            }
            return t.status() == StatusTarefa.CONCLUIDO
                    ? new Span(Datas.data(t.dataEntrega())) : Chips.prazo(prazo);
        }).setHeader("Prazo").setAutoWidth(true).setFlexGrow(0);

        grade.addComponentColumn(t -> Chips.prioridade(t.prioridade()))
                .setHeader("Prioridade").setAutoWidth(true).setFlexGrow(0);

        grade.addComponentColumn(t -> Chips.status(t.status()))
                .setHeader("Status").setAutoWidth(true).setFlexGrow(0);

        grade.addComponentColumn(t -> {
            Button editar = new Button(VaadinIcon.EDIT.create(), e -> abrirFormulario(t));
            editar.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON, ButtonVariant.LUMO_SMALL);
            editar.setAriaLabel("Editar " + t.titulo());
            Button excluir = new Button(VaadinIcon.TRASH.create(), e -> confirmarExclusao(t));
            excluir.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON, ButtonVariant.LUMO_SMALL,
                    ButtonVariant.LUMO_ERROR);
            excluir.setAriaLabel("Excluir " + t.titulo());
            return new Div(editar, excluir);
        }).setHeader("").setWidth("110px").setFlexGrow(0);
    }

    // ---------- quadro ----------

    private void montarQuadro() {
        quadro.removeAll();
        List<TarefaResponse> visiveis = todas.stream().filter(this::passaNoFiltro).toList();
        for (StatusTarefa status : StatusTarefa.values()) {
            Div coluna = new Div();
            coluna.addClassNames("coluna", "coluna--" + status.name().toLowerCase(Locale.ROOT));

            List<TarefaResponse> daColuna = visiveis.stream().filter(t -> t.status() == status).toList();
            Span titulo = new Span(Rotulos.status(status));
            titulo.addClassName("coluna__titulo");
            Span contagem = new Span(String.valueOf(daColuna.size()));
            contagem.addClassNames("chip", "chip--neutro");
            Div cabecalho = new Div(titulo, contagem);
            cabecalho.addClassName("coluna__cabecalho");
            coluna.add(cabecalho);

            if (daColuna.isEmpty()) {
                Span vazio = new Span("Arraste tarefas para cá");
                vazio.addClassNames("texto-mudo", "coluna__vazio");
                coluna.add(vazio);
            }
            daColuna.forEach(t -> coluna.add(criarCartao(t)));

            DropTarget<Div> alvo = DropTarget.create(coluna);
            alvo.addDropListener(evento -> evento.getDragData().ifPresent(dado -> {
                if (dado instanceof TarefaResponse movida && movida.status() != status) {
                    tarefas.alterarStatus(movida.id(), status, email);
                    recarregar();
                }
            }));
            quadro.add(coluna);
        }
    }

    private Div criarCartao(TarefaResponse t) {
        Span titulo = new Span(t.titulo());
        titulo.addClassName("cartao__titulo");
        Div cartao = new Div(titulo);
        cartao.addClassName("cartao");

        Div etiquetas = new Div(Chips.prioridade(t.prioridade()));
        etiquetas.addClassName("cartao__etiquetas");
        var prazo = Datas.prazo(t.dataEntrega(), LocalDate.now(relogio));
        if (prazo != null && t.status() != StatusTarefa.CONCLUIDO) {
            etiquetas.add(Chips.prazo(prazo));
        }
        cartao.add(etiquetas);
        if (t.materia() != null) {
            cartao.add(Chips.materia(t.materia()));
        }

        Button editar = new Button(VaadinIcon.EDIT.create(), e -> abrirFormulario(t));
        editar.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON, ButtonVariant.LUMO_SMALL);
        editar.setAriaLabel("Editar " + t.titulo());
        Button excluir = new Button(VaadinIcon.TRASH.create(), e -> confirmarExclusao(t));
        excluir.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON, ButtonVariant.LUMO_SMALL,
                ButtonVariant.LUMO_ERROR);
        excluir.setAriaLabel("Excluir " + t.titulo());
        Div acoes = new Div(editar, excluir);
        acoes.addClassName("cartao__acoes");
        cartao.add(acoes);

        DragSource<Div> origem = DragSource.create(cartao);
        origem.setDragData(t);
        return cartao;
    }

    // ---------- dados e filtros ----------

    private void recarregar() {
        todas.clear();
        todas.addAll(tarefas.listar(email));
        provedor.getItems().clear();
        provedor.getItems().addAll(todas);
        provedor.refreshAll();
        aplicarFiltro();
    }

    private void aplicarFiltro() {
        provedor.setFilter(this::passaNoFiltro);
        montarQuadro();
        grade.setVisible(!todas.isEmpty());
        lista.removeAll();
        if (todas.isEmpty()) {
            Button criar = new Button("Criar a primeira tarefa", e -> abrirFormulario(null));
            criar.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
            lista.add(Vazio.criar(VaadinIcon.TASKS, "Nenhuma tarefa ainda",
                    "Cadastre tarefas com prazo para receber avisos e acompanhar o progresso.", criar));
        } else {
            lista.add(grade);
        }
    }

    private boolean passaNoFiltro(TarefaResponse t) {
        String texto = busca.getValue() == null ? "" : busca.getValue().trim().toLowerCase(Locale.ROOT);
        if (!texto.isEmpty() && !t.titulo().toLowerCase(Locale.ROOT).contains(texto)) {
            return false;
        }
        if (filtroStatus.getValue() != null && t.status() != filtroStatus.getValue()) {
            return false;
        }
        MateriaResumo m = filtroMateria.getValue();
        return m == null || (t.materia() != null && m.id().equals(t.materia().id()));
    }

    private void confirmarExclusao(TarefaResponse t) {
        Confirmar.exclusao("Excluir tarefa", "Excluir \"" + t.titulo() + "\"?", () -> {
            tarefas.deletar(t.id(), email);
            Toasts.sucesso("Tarefa excluída");
            recarregar();
        });
    }

    // ---------- formulario ----------

    private void abrirFormulario(TarefaResponse existente) {
        Dialog dialogo = new Dialog();
        dialogo.setHeaderTitle(existente == null ? "Nova tarefa" : "Editar tarefa");
        dialogo.setWidth("520px");
        dialogo.setMaxWidth("96vw");

        TextField titulo = new TextField("Título");
        titulo.setMaxLength(150);
        titulo.setWidthFull();
        titulo.setAutofocus(true);
        TextArea descricao = new TextArea("Descrição (opcional)");
        descricao.setMaxLength(1000);
        descricao.setWidthFull();
        descricao.setMinHeight("90px");

        Select<MateriaResumo> materia = new Select<>();
        materia.setLabel("Matéria");
        materia.setEmptySelectionAllowed(true);
        materia.setEmptySelectionCaption("Sem matéria");
        List<MateriaResumo> itens = materias.listar(email).stream().map(MateriaResponse::resumo).toList();
        materia.setItems(itens);
        materia.setItemLabelGenerator(MateriaResumo::nome);

        DatePicker prazo = new DatePicker("Prazo");
        prazo.setLocale(Datas.PT_BR);
        prazo.setClearButtonVisible(true);

        Select<Prioridade> prioridade = new Select<>();
        prioridade.setLabel("Prioridade");
        prioridade.setItems(Prioridade.values());
        prioridade.setItemLabelGenerator(Rotulos::prioridade);
        prioridade.setValue(Prioridade.MEDIA);

        Select<StatusTarefa> status = new Select<>();
        status.setLabel("Status");
        status.setItems(StatusTarefa.values());
        status.setItemLabelGenerator(Rotulos::status);
        status.setValue(StatusTarefa.A_FAZER);

        if (existente != null) {
            titulo.setValue(existente.titulo());
            descricao.setValue(existente.descricao() == null ? "" : existente.descricao());
            prazo.setValue(existente.dataEntrega());
            prioridade.setValue(existente.prioridade());
            status.setValue(existente.status());
            if (existente.materia() != null) {
                itens.stream().filter(m -> m.id().equals(existente.materia().id())).findFirst()
                        .ifPresent(materia::setValue);
            }
        }

        Div linha = new Div(prazo, prioridade, status);
        linha.addClassName("form-linha");
        Div form = new Div(titulo, descricao, materia, linha);
        form.addClassName("form-coluna");
        dialogo.add(form);

        Button cancelar = new Button("Cancelar", e -> dialogo.close());
        cancelar.addThemeVariants(ButtonVariant.LUMO_TERTIARY);
        Button salvar = new Button("Salvar", e -> {
            MateriaResumo m = materia.getValue();
            TarefaRequest req = new TarefaRequest(titulo.getValue(), descricao.getValue(), prazo.getValue(),
                    prioridade.getValue(), status.getValue(), m == null ? null : m.id());
            if (!validador.validar(req, Map.of("titulo", titulo, "descricao", descricao))) {
                return;
            }
            if (existente == null) {
                tarefas.criar(req, email);
            } else {
                tarefas.atualizar(existente.id(), req, email);
            }
            dialogo.close();
            Toasts.sucesso("Tarefa salva");
            recarregar();
        });
        salvar.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        dialogo.getFooter().add(cancelar, salvar);
        dialogo.open();
    }
}
