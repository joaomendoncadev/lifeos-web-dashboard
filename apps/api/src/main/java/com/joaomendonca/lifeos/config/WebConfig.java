package com.joaomendonca.lifeos.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Value("${lifeos.cors.allowed-origin:http://localhost:3000}") private String allowedOrigin;
  @Override public void addCorsMappings(CorsRegistry registry) { registry.addMapping("/api/**").allowedOrigins(allowedOrigin).allowedMethods("GET","POST","PATCH","PUT","DELETE","OPTIONS"); }
}
