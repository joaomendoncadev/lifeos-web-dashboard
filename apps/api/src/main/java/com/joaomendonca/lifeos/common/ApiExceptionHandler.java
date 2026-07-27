package com.joaomendonca.lifeos.common;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(IllegalArgumentException.class) @ResponseStatus(HttpStatus.BAD_REQUEST)
  Map<String,Object> badRequest(IllegalArgumentException ex) { return Map.of("timestamp", Instant.now(), "message", ex.getMessage()); }
  @ExceptionHandler(MethodArgumentNotValidException.class) @ResponseStatus(HttpStatus.BAD_REQUEST)
  Map<String,Object> validation(MethodArgumentNotValidException ex) { var e=ex.getBindingResult().getFieldErrors().getFirst(); return Map.of("timestamp",Instant.now(),"message",e.getField()+": "+e.getDefaultMessage()); }
}
