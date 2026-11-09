/*
package br.univille.doabem.registry.controller;

import br.univille.doabem.registry.dto.FamilyRequestDTO;
import br.univille.doabem.registry.dto.FamilyResponseDTO;
import br.univille.doabem.registry.service.FamilyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
@RestController
@RequestMapping("/api/v1/families")
@Tag(name = "Famílias Beneficiárias", description = "Endpoints para gestão e cadastro de famílias atendidas")
public class FamilyController {

    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    @GetMapping
    @Operation(summary = "Listar famílias paginadas", description = "Retorna uma lista paginada de famílias beneficiárias, podendo filtrar por bairro.")
    public ResponseEntity<Page<FamilyResponseDTO>> listAll(
            @RequestParam(required = false) String neighborhood,
            @PageableDefault(size = 10, sort = "representativeName") Pageable pageable) {

        Page<FamilyResponseDTO> page = familyService.findAll(neighborhood, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar família por ID", description = "Retorna os dados detalhados de uma família específica.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Família encontrada"),
            @ApiResponse(responseCode = "404", description = "Família não encontrada com o ID informado")
    })
    public ResponseEntity<FamilyResponseDTO> getById(@PathVariable Long id) {
        FamilyResponseDTO dto = familyService.findById(id);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @Operation(summary = "Cadastrar nova família", description = "Cria um novo registro de família beneficiária no sistema.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Família criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos ou CPF já cadastrado")
    })
    public ResponseEntity<FamilyResponseDTO> create(@Valid @RequestBody FamilyRequestDTO requestDTO) {
        FamilyResponseDTO createdDTO = familyService.create(requestDTO);

        // Constrói o URI do novo recurso criado (/api/v1/families/{id}) para o cabeçalho Location (Padrão REST HTTP 201 Created)
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdDTO.id())
                .toUri();

        return ResponseEntity.created(uri).body(createdDTO);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar cadastro da família", description = "Atualiza todos os dados de uma família existente.")
    public ResponseEntity<FamilyResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody FamilyRequestDTO requestDTO) {

        FamilyResponseDTO updatedDTO = familyService.update(id, requestDTO);
        return ResponseEntity.ok(updatedDTO);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Alterar status (Ativo/Inativo)", description = "Ativa ou desativa o cadastro de uma família beneficiária.")
    public ResponseEntity<Void> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        familyService.updateStatus(id, active);
        return ResponseEntity.noContent().build(); // Retorna 204 No Content
    }
}


 */