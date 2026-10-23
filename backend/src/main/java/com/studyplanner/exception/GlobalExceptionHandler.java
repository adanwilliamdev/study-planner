package com.studyplanner.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    public record ApiError(String message, Map<String, String> errors) {}

    private static ResponseEntity<ApiError> resposta(HttpStatus status, String msg, Map<String, String> erros) {
        return ResponseEntity.status(status).body(new ApiError(msg, erros));
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ApiError> naoEncontrado(RecursoNaoEncontradoException ex) {
        return resposta(HttpStatus.NOT_FOUND, ex.getMessage(), Map.of());
    }

    @ExceptionHandler(RegraDeNegocioException.class)
    public ResponseEntity<ApiError> regra(RegraDeNegocioException ex) {
        return resposta(ex.getStatus(), ex.getMessage(), Map.of());
    }

    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<ApiError> credenciais(AuthenticationException ex) {
        return resposta(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos", Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validacao(MethodArgumentNotValidException ex) {
        Map<String, String> erros = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> erros.putIfAbsent(e.getField(), e.getDefaultMessage()));
        String msg = erros.values().stream().findFirst().orElse("Dados inválidos");
        return resposta(HttpStatus.BAD_REQUEST, msg, erros);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiError> corpoInvalido(Exception ex) {
        return resposta(HttpStatus.BAD_REQUEST, "Requisição inválida: verifique os campos enviados", Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> inesperado(Exception ex) throws Exception {
        // deixa o Spring tratar excecoes de seguranca/MVC conhecidas (403, 404 de rota, 405...)
        if (ex instanceof org.springframework.security.access.AccessDeniedException
                || ex instanceof org.springframework.web.ErrorResponse) {
            throw ex;
        }
        log.error("Erro inesperado", ex);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno do servidor", Map.of());
    }
}
