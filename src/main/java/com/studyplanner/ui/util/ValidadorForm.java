package com.studyplanner.ui.util;

import com.vaadin.flow.component.HasValidation;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Reaproveita as anotacoes de Bean Validation dos DTOs (@NotBlank, @Size...) nos formularios:
 * valida o objeto e mostra cada mensagem no campo correspondente.
 */
@Component
public class ValidadorForm {

    private final Validator validator;

    public ValidadorForm(Validator validator) {
        this.validator = validator;
    }

    /** Valida o DTO; devolve true se estiver tudo certo. As mensagens vao para os campos de mesmo nome. */
    public boolean validar(Object dto, Map<String, ?> campos) {
        Map<String, String> erros = new LinkedHashMap<>();
        for (ConstraintViolation<Object> v : validator.validate(dto)) {
            erros.putIfAbsent(v.getPropertyPath().toString(), v.getMessage());
        }
        campos.forEach((nome, campo) -> {
            if (campo instanceof HasValidation validavel) {
                String mensagem = erros.get(nome);
                validavel.setErrorMessage(mensagem);
                validavel.setInvalid(mensagem != null);
            }
        });
        return erros.isEmpty();
    }
}
