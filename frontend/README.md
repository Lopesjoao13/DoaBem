# Frontend — DoaBem

Interface web que consome a API REST do backend. A tecnologia (JavaScript puro ou framework) está pendente de decisão do grupo (ver `docs/arquitetura.md`, decisão T06).

## Referência visual

- Capturas do protótipo e guia visual: `docs/mockups/prototipo.md`
- Fluxo de telas e identidade visual: `docs/mockups/fluxo-telas.md`
- Protótipo navegável (dados fictícios): https://doabem-stock-hub.lovable.app/
- Figma (telas e guia de identidade visual): https://www.figma.com/design/Epm1g1xvCIwoikzaPzqoTf/Untitled?node-id=0-1
- Revisão do protótipo contra os requisitos: `docs/mockups/revisao-prototipo.md`

## Diretrizes

- Nenhuma regra de negócio relevante no JavaScript de tela; o backend valida e decide.
- Estados de carregamento, vazio, erro e sucesso em toda tela.
- Unidade (un, kg, L) sempre junto a quantidades e saldos; alerta crítico com texto, não só cor.
- Ações restritas ao Coordenador não aparecem para o Operador (o backend também nega com 403).
