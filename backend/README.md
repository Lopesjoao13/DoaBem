# Backend — DoaBem

Java 21 + Spring Boot 3.x, monólito modular em camadas. Projeto a ser criado na Sprint 02 (primeiro fluxo vertical).

## Estrutura sugerida

```
backend/
└── src/main/java/br/univille/doabem/
    ├── access/             usuários, login e perfis
    ├── registry/           categorias, itens e famílias
    ├── entries/            entrada de doação
    ├── stock/              saldo, ajuste e estorno
    ├── requests/           solicitação, aprovação, separação e entrega
    ├── dashboard/          indicadores e históricos
    └── common/             erros padronizados, configuração e segurança
```

Dentro de cada módulo: `controller`, `service`, `repository`, `dto` e `entity`. Regra de negócio fica só no `service`.

## Referências

- Requisitos: `docs/requisitos.md`
- DER: `docs/der/der.md`
- Arquitetura: `docs/arquitetura.md`
