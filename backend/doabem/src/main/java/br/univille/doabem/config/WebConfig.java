package br.univille.doabem.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;

import static org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO;

// Serializa Page como DTO estável (content + page), em vez da estrutura interna do PageImpl.
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)
public class WebConfig {
}
