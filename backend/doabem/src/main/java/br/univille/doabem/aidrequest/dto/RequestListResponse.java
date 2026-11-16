package br.univille.doabem.aidrequest.dto;

import org.springframework.data.web.PagedModel.PageMetadata;

import java.util.List;
import java.util.Map;

// Mesmo formato das demais listas ({content, page}) mais a contagem por estado, usada nas abas da tela.
public record RequestListResponse(
        List<RequestRowResponse> content,
        PageMetadata page,
        Map<String, Long> counts
) {
}
