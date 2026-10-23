package com.studyplanner.exception;

import org.springframework.http.HttpStatus;

public class RegraDeNegocioException extends RuntimeException {
    private final HttpStatus status;

    public RegraDeNegocioException(String mensagem) { this(mensagem, HttpStatus.BAD_REQUEST); }

    public RegraDeNegocioException(String mensagem, HttpStatus status) {
        super(mensagem);
        this.status = status;
    }

    public HttpStatus getStatus() { return status; }
}
