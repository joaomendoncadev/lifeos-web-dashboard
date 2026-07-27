package com.joaomendonca.lifeos.common;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
  private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

  public record ApiError(Instant timestamp, int status, String error, String message,
                         String path, Map<String, String> fieldErrors) {}

  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<ApiError> badRequest(IllegalArgumentException ex, HttpServletRequest request) {
    return response(HttpStatus.BAD_REQUEST, ex.getMessage(), request, Map.of());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex, HttpServletRequest request) {
    Map<String, String> fields = new LinkedHashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(error ->
        fields.putIfAbsent(error.getField(), error.getDefaultMessage() == null ? "Valor inválido." : error.getDefaultMessage()));
    return response(HttpStatus.BAD_REQUEST, "Revise os campos informados.", request, fields);
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiError> unexpected(Exception ex, HttpServletRequest request) {
    log.error("Erro inesperado em {} {}", request.getMethod(), request.getRequestURI(), ex);
    return response(HttpStatus.INTERNAL_SERVER_ERROR,
        "Não foi possível concluir a operação. Tente novamente.", request, Map.of());
  }

  private ResponseEntity<ApiError> response(HttpStatus status, String message,
                                             HttpServletRequest request, Map<String, String> fields) {
    return ResponseEntity.status(status).body(new ApiError(
        Instant.now(), status.value(), status.getReasonPhrase(), message,
        request.getRequestURI(), fields));
  }
}
