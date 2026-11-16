package br.univille.doabem.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

// RNF09: API documentada com OpenAPI/Swagger. Todas as rotas exigem o JWT, exceto as marcadas com @SecurityRequirements vazio.
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "DoaBem API",
                version = "0.0.1",
                description = "Gestão de doações e distribuição de recursos"),
        security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT")
public class OpenApiConfig {
}
