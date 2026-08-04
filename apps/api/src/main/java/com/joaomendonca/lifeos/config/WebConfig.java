package com.joaomendonca.lifeos.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Value("${lifeos.cors.allowed-origin:*}") private String allowedOrigin;
  @Override public void addCorsMappings(CorsRegistry registry) {
    var mapping = registry.addMapping("/api/**").allowedMethods("GET","POST","PATCH","PUT","DELETE","OPTIONS");
    if ("*".equals(allowedOrigin)) {
      mapping.allowedOriginPatterns("*");
    } else {
      mapping.allowedOrigins(allowedOrigin);
    }
  }
}
