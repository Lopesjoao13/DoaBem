package br.univille.doabem.common.error;

import org.springframework.data.mapping.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Mesma mensagem para senha errada, e-mail inexistente e usuário inativo (não revela qual).
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(401, "E-mail ou senha inválidos. Tente novamente."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .collect(Collectors.joining(" "));
        return ResponseEntity.badRequest().body(new ErrorResponse(400, message));
    }

    // Ex.: ?sort=campoQueNaoExiste
    @ExceptionHandler(PropertyReferenceException.class)
    public ResponseEntity<ErrorResponse> handleInvalidSort(PropertyReferenceException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Ordenação inválida: o campo \"" + ex.getPropertyName() + "\" não existe."));
    }

    // Ex.: ?status=XYZ ou ?categoryId=abc
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest()
                .body(new ErrorResponse(400, "Valor inválido para o parâmetro \"" + ex.getName() + "\"."));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(404, ex.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(409, ex.getMessage()));
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(BusinessRuleException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(new ErrorResponse(422, ex.getMessage()));
    }
}
