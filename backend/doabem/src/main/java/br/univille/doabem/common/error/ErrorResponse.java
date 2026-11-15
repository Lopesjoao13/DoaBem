package br.univille.doabem.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

// fieldErrors (campo -> mensagem) só aparece quando o erro é de validação de campos.
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(int status, String message, Map<String, String> fieldErrors) {

    public ErrorResponse(int status, String message) {
        this(status, message, null);
    }
}
