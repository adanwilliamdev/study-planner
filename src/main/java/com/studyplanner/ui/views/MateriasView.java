package com.studyplanner.ui.views;

import com.studyplanner.dto.MateriaRequest;
import com.studyplanner.dto.MateriaResponse;
import com.studyplanner.service.MateriaService;
import com.studyplanner.service.MaterialService;
import com.studyplanner.ui.MainLayout;
import com.studyplanner.ui.componentes.MateriaisDialog;
import com.studyplanner.ui.util.Confirmar;
import com.studyplanner.ui.util.Cores;
import com.studyplanner.ui.util.Toasts;
import com.studyplanner.ui.util.ValidadorForm;
import com.studyplanner.ui.util.Vazio;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.textfield.IntegerField;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.data.renderer.ComponentRenderer;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.spring.security.AuthenticationContext;
import jakarta.annotation.security.PermitAll;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Route(value = "materias", layout = MainLayout.class)
@PageTitle("Matérias")
@PermitAll
public class MateriasView extends Div {

    private final String email;
    private final MateriaService materias;
    private final MaterialService materiais;
    private final ValidadorForm validador;
    private final Div grade = new Div();

    public MateriasView(AuthenticationContext autenticacao, MateriaService materias, MaterialService materiais,
                        ValidadorForm validador) {
        this.email = autenticacao.getPrincipalName().orElseThrow();
        this.materias = materias;
        this.materiais = materiais;
        this.validador = validador;
        addClassName("pagina");

        Span dica = new Span("Cada matéria tem uma cor, usada em tarefas, cronograma e gráficos.");
        dica.addClassName("texto-mudo");
        Button nova = new Button("Nova matéria", VaadinIcon.PLUS.create(), e -> abrirFormulario(null));
        nova.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        Div topo = new Div(dica, nova);
        topo.addClassName("pagina__topo");

        grade.addClassName("grade-cartoes");
        add(topo, grade);
        carregar();
    }

    private void carregar() {
        grade.removeAll();
        List<MateriaResponse> lista = materias.listar(email);
        if (lista.isEmpty()) {
            Button criar = new Button("Criar a primeira matéria", e -> abrirFormulario(null));
            criar.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
            grade.add(Vazio.criar(VaadinIcon.BOOK, "Nenhuma matéria ainda",
                    "Comece cadastrando as matérias que você estuda.", criar));
            return;
        }
        lista.forEach(m -> grade.add(cartao(m)));
    }

    private Div cartao(MateriaResponse m) {
        String cor = Cores.seguro(m.cor());
        Span iniciais = new Span(Cores.iniciais(m.nome()));
        Div avatar = new Div(iniciais);
        avatar.addClassName("cartao-materia__avatar");
        avatar.getStyle().set("background-color", cor).set("color", Cores.textoSobre(cor));

        Span nome = new Span(m.nome());
        nome.addClassName("cartao-materia__nome");
        int horas = m.cargaHoraria() == null ? 0 : m.cargaHoraria();
        Span carga = new Span(horas == 0 ? "Sem carga horária" : horas + " h de carga horária");
        carga.addClassName("texto-mudo");
        Div texto = new Div(nome, carga);
        texto.addClassName("cartao-materia__texto");

        Button materiaisBtn = new Button("Materiais", VaadinIcon.FILE_TEXT_O.create(),
                e -> new MateriaisDialog(m, email, materiais, validador).open());
        materiaisBtn.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_SMALL);
        Button editar = new Button(VaadinIcon.EDIT.create(), e -> abrirFormulario(m));
        editar.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON, ButtonVariant.LUMO_SMALL);
        editar.setAriaLabel("Editar " + m.nome());
        Button excluir = new Button(VaadinIcon.TRASH.create(), e -> Confirmar.exclusao("Excluir matéria",
                "Excluir \"" + m.nome() + "\"? Isso também remove as tarefas, as sessões do cronograma e os materiais dela.",
                () -> {
                    materias.deletar(m.id(), email);
                    Toasts.sucesso("Matéria excluída");
                    carregar();
                }));
        excluir.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON, ButtonVariant.LUMO_SMALL,
                ButtonVariant.LUMO_ERROR);
        excluir.setAriaLabel("Excluir " + m.nome());

        Div acoes = new Div(materiaisBtn, editar, excluir);
        acoes.addClassName("cartao-materia__acoes");

        Div topo = new Div(avatar, texto);
        topo.addClassName("cartao-materia__topo");
        Div cartao = new Div(topo, acoes);
        cartao.addClassName("cartao-materia");
        cartao.getStyle().set("--cor-materia", cor);
        return cartao;
    }

    private void abrirFormulario(MateriaResponse existente) {
        Dialog dialogo = new Dialog();
        dialogo.setHeaderTitle(existente == null ? "Nova matéria" : "Editar matéria");
        dialogo.setWidth("420px");
        dialogo.setMaxWidth("96vw");

        TextField nome = new TextField("Nome");
        nome.setMaxLength(100);
        nome.setWidthFull();
        nome.setAutofocus(true);

        List<String> cores = new ArrayList<>(Cores.PALETA);
        String corInicial = existente == null ? Cores.PADRAO : Cores.seguro(existente.cor());
        if (!cores.contains(corInicial)) {
            cores.add(0, corInicial);
        }
        Select<String> cor = new Select<>();
        cor.setLabel("Cor");
        cor.setItems(cores);
        cor.setRenderer(new ComponentRenderer<>(c -> {
            Span ponto = new Span();
            ponto.addClassName("ponto-cor");
            ponto.getStyle().set("background-color", c);
            Span rotulo = new Span(c.toUpperCase());
            Div d = new Div(ponto, rotulo);
            d.addClassName("seletor-cor");
            return d;
        }));
        cor.setValue(corInicial);
        cor.setWidthFull();

        IntegerField carga = new IntegerField("Carga horária (horas)");
        carga.setMin(0);
        carga.setMax(10000);
        carga.setStepButtonsVisible(true);
        carga.setWidthFull();

        if (existente != null) {
            nome.setValue(existente.nome());
            carga.setValue(existente.cargaHoraria());
        }

        Div form = new Div(nome, cor, carga);
        form.addClassName("form-coluna");
        dialogo.add(form);

        Button cancelar = new Button("Cancelar", e -> dialogo.close());
        cancelar.addThemeVariants(ButtonVariant.LUMO_TERTIARY);
        Button salvar = new Button("Salvar", e -> {
            MateriaRequest req = new MateriaRequest(nome.getValue(), cor.getValue(), carga.getValue());
            if (!validador.validar(req, Map.of("nome", nome, "cor", cor, "cargaHoraria", carga))) {
                return;
            }
            if (existente == null) {
                materias.criar(req, email);
            } else {
                materias.atualizar(existente.id(), req, email);
            }
            dialogo.close();
            Toasts.sucesso("Matéria salva");
            carregar();
        });
        salvar.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        salvar.addClickShortcut(com.vaadin.flow.component.Key.ENTER);
        dialogo.getFooter().add(cancelar, salvar);
        dialogo.open();
    }
}
