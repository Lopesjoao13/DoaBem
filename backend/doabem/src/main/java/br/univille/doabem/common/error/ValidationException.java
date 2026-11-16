package br.univille.doabem.common.error;

import java.util.Map;

// Erro de validação detectado no serviço (regra que depende do estado): vira 400 com fieldErrors.
public class ValidationException extends RuntimeException {

    private final transient Map<String, String> fieldErrors;

    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(message);
        this.fieldErrors = fieldErrors;
    }

    public ValidationException(String field, String fieldMessage) {
        this("Revise os campos destacados.", Map.of(field, fieldMessage));
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
