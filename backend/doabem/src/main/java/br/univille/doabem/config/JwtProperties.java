package br.univille.doabem.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "doabem.jwt")
public record JwtProperties(String secret, long expirationMinutes) {
}
