package com.studyplanner.ui.componentes;

import com.studyplanner.dto.MateriaResponse;
import com.studyplanner.dto.MaterialRequest;
import com.studyplanner.dto.MaterialResponse;
import com.studyplanner.entity.MaterialEstudo.TipoMaterial;
import com.studyplanner.service.MaterialService;
import com.studyplanner.ui.util.Confirmar;
import com.studyplanner.ui.util.Rotulos;
import com.studyplanner.ui.util.ValidadorForm;
import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.html.Anchor;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.textfield.TextArea;
import com.vaadin.flow.component.textfield.TextField;

import java.util.List;
import java.util.Map;

/** Materiais de estudo (links, PDFs e resumos) de uma materia. */
public class MateriaisDialog extends Dialog {

    private final MateriaResponse materia;
    private final String email;
    private final MaterialService servico;
    private final ValidadorForm validador;

    private final Div lista = new Div();
    private final TextField titulo = new TextField("Título");
    private final Select<TipoMaterial> tipo = new Select<>();
    private final TextArea conteudo = new TextArea("Link, caminho do arquivo ou resumo");

    public MateriaisDialog(MateriaResponse materia, String email, MaterialService servico, ValidadorForm validador) {
        this.materia = materia;
        this.email = email;
        this.servico = servico;
        this.validador = validador;

        setHeaderTitle("Materiais · " + materia.nome());
        setWidth("560px");
        setMaxWidth("96vw");
        addClassName("dialogo-materiais");

        lista.addClassName("lista");

        titulo.setMaxLength(150);
        titulo.setWidthFull();
        tipo.setLabel("Tipo");
        tipo.setItems(TipoMaterial.values());
        tipo.setItemLabelGenerator(Rotulos::tipoMaterial);
        tipo.setValue(TipoMaterial.LINK);
        conteudo.setMaxLength(1000);
        conteudo.setWidthFull();
        conteudo.setMinHeight("90px");

        Button adicionar = new Button("Adicionar material", VaadinIcon.PLUS.create(), e -> adicionar());
        adicionar.addThemeVariants(ButtonVariant.LUMO_PRIMARY);

        Div formulario = new Div(titulo, tipo, conteudo, adicionar);
        formulario.addClassName("form-coluna");

        add(lista, formulario);
        Button fechar = new Button("Fechar", e -> close());
        getFooter().add(fechar);
        recarregar();
    }

    private void adicionar() {
        MaterialRequest req = new MaterialRequest(materia.id(), titulo.getValue(), tipo.getValue(), conteudo.getValue());
        if (!validador.validar(req, Map.of("titulo", titulo, "tipo", tipo, "urlOuCaminho", conteudo))) {
            return;
        }
        servico.criar(req, email);
        titulo.clear();
        conteudo.clear();
        recarregar();
    }

    private void recarregar() {
        lista.removeAll();
        List<MaterialResponse> itens = servico.listarPorMateria(materia.id(), email);
        if (itens.isEmpty()) {
            Span vazio = new Span("Nenhum material ainda. Adicione links, PDFs ou resumos abaixo.");
            vazio.addClassName("texto-mudo");
            lista.add(vazio);
            return;
        }
        for (MaterialResponse m : itens) {
            Component nome = criarNome(m);
            Span tipoChip = new Span(Rotulos.tipoMaterial(m.tipo()));
            tipoChip.addClassNames("chip", "chip--neutro");
            Button excluir = new Button(VaadinIcon.TRASH.create(), e ->
                    Confirmar.exclusao("Excluir material", "Excluir \"" + m.titulo() + "\"?", () -> {
                        servico.deletar(m.id(), email);
                        recarregar();
                    }));
            excluir.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_ICON, ButtonVariant.LUMO_ERROR);
            excluir.setAriaLabel("Excluir " + m.titulo());
            Div corpo = new Div(nome);
            corpo.addClassName("item__corpo");
            Div item = new Div(corpo, tipoChip, excluir);
            item.addClassName("item");
            lista.add(item);
        }
    }

    /** Links http(s) viram ancoras; o resto aparece como texto (nunca como link executavel). */
    private Component criarNome(MaterialResponse m) {
        String valor = m.urlOuCaminho();
        boolean web = valor != null && (valor.toLowerCase().startsWith("http://") || valor.toLowerCase().startsWith("https://"));
        if (web) {
            Anchor a = new Anchor(valor, m.titulo());
            a.setTarget("_blank");
            a.getElement().setAttribute("rel", "noopener noreferrer");
            return a;
        }
        Span s = new Span(m.titulo());
        s.addClassName("item__titulo");
        if (valor != null && !valor.isBlank()) {
            s.getElement().setAttribute("title", valor);
        }
        return s;
    }
}
