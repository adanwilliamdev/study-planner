package com.studyplanner.exception;

/** Violacao de regra de negocio; a mensagem e mostrada ao usuario. */
public class RegraDeNegocioException extends RuntimeException {
    public RegraDeNegocioException(String mensagem) {
        super(mensagem);
    }
}
