package com.studyplanner.ui;

import com.studyplanner.exception.RecursoNaoEncontradoException;
import com.studyplanner.exception.RegraDeNegocioException;
import com.studyplanner.ui.util.Toasts;
import com.vaadin.flow.component.UI;
import com.vaadin.flow.server.ErrorEvent;
import com.vaadin.flow.server.ServiceInitEvent;
import com.vaadin.flow.server.VaadinServiceInitListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Tratamento central de erros da interface: regras de negocio viram mensagem na tela
 * (o dialogo continua aberto para o usuario corrigir); o resto e registrado no log.
 */
@Component
public class ErrosVaadinInit implements VaadinServiceInitListener {

    private static final Logger log = LoggerFactory.getLogger(ErrosVaadinInit.class);

    @Override
    public void serviceInit(ServiceInitEvent evento) {
        evento.getSource().addSessionInitListener(
                sessao -> sessao.getSession().setErrorHandler(this::tratar));
    }

    private void tratar(ErrorEvent evento) {
        for (Throwable t = evento.getThrowable(); t != null; t = t.getCause() == t ? null : t.getCause()) {
            if (t instanceof RegraDeNegocioException || t instanceof RecursoNaoEncontradoException) {
                avisar(t.getMessage());
                return;
            }
        }
        log.error("Erro inesperado na interface", evento.getThrowable());
        avisar("Algo deu errado. Tente novamente.");
    }

    private void avisar(String mensagem) {
        UI ui = UI.getCurrent();
        if (ui != null) {
            ui.access(() -> Toasts.erro(mensagem));
        }
    }
}
