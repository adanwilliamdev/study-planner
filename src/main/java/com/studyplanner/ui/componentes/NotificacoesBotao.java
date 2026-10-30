package com.studyplanner.ui.componentes;

import com.studyplanner.dto.NotificacaoResponse;
import com.studyplanner.service.NotificacaoBroadcaster;
import com.studyplanner.service.NotificacaoService;
import com.studyplanner.ui.util.Datas;
import com.studyplanner.ui.util.Toasts;
import com.vaadin.flow.component.AttachEvent;
import com.vaadin.flow.component.DetachEvent;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.shared.Registration;

import java.util.List;

/**
 * Sino da barra superior. Mostra quantas notificacoes ainda nao foram lidas e,
 * via server push, recebe novos alertas sem precisar recarregar a pagina.
 */
public class NotificacoesBotao extends Div {

    private final String email;
    private final NotificacaoService servico;
    private final NotificacaoBroadcaster broadcaster;
    private final Span contador = new Span();
    private Registration registro;

    public NotificacoesBotao(String email, NotificacaoService servico, NotificacaoBroadcaster broadcaster) {
        this.email = email;
        this.servico = servico;
        this.broadcaster = broadcaster;
        addClassName("notif");

        Button sino = new Button(VaadinIcon.BELL_O.create(), e -> abrir());
        sino.addThemeVariants(ButtonVariant.LUMO_TERTIARY, ButtonVariant.LUMO_CONTRAST);
        sino.setAriaLabel("Notificações");
        contador.addClassName("notif__contador");
        add(sino, contador);
        atualizarContador();
    }

    @Override
    protected void onAttach(AttachEvent evento) {
        UI ui = evento.getUI();
        atualizarContador();
        registro = broadcaster.registrar(email, notificacao -> ui.access(() -> {
            atualizarContador();
            Toasts.info(notificacao.mensagem());
        }));
    }

    @Override
    protected void onDetach(DetachEvent evento) {
        if (registro != null) {
            registro.remove();
            registro = null;
        }
    }

    private void atualizarContador() {
        long n = servico.naoLidas(email);
        contador.setText(n > 99 ? "99+" : String.valueOf(n));
        contador.setVisible(n > 0);
    }

    private void abrir() {
        List<NotificacaoResponse> itens = servico.recentes(email);

        Dialog dialogo = new Dialog();
        dialogo.setHeaderTitle("Notificações");
        dialogo.addClassName("dialogo-notificacoes");

        Div lista = new Div();
        lista.addClassName("notif-lista");
        if (itens.isEmpty()) {
            Span vazio = new Span("Nenhuma notificação por aqui. Os avisos de prazo aparecem neste lugar.");
            vazio.addClassName("texto-mudo");
            lista.add(vazio);
        }
        for (NotificacaoResponse n : itens) {
            Span texto = new Span(n.mensagem());
            texto.addClassName("notif-item__texto");
            Span quando = new Span(Datas.dataHora(n.criadaEm()));
            quando.addClassName("texto-mudo");
            Div item = new Div(texto, quando);
            item.addClassName("notif-item");
            if (!n.lida()) {
                item.addClassName("notif-item--nova");
            }
            lista.add(item);
        }
        dialogo.add(lista);

        Button fechar = new Button("Fechar", e -> dialogo.close());
        fechar.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        dialogo.getFooter().add(fechar);

        // ao fechar, tudo que foi exibido conta como lido
        dialogo.addOpenedChangeListener(e -> {
            if (!e.isOpened()) {
                servico.marcarTodasComoLidas(email);
                atualizarContador();
            }
        });
        dialogo.open();
    }
}
