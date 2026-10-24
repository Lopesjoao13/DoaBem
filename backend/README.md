# Backend — DoaBem

Java 21 + Spring Boot 3.x, monólito modular em camadas. O projeto Maven fica em `backend/doabem`.

## Como executar

Todos os comandos abaixo rodam dentro de `backend/doabem` (é onde está o `mvnw`):

```powershell
cd backend\doabem
```

O perfil é escolhido em `application.properties` por `spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}`: sem nenhuma configuração, sobe o **dev**. Para outro perfil, informe `SPRING_PROFILES_ACTIVE` ou o argumento do Maven mostrado abaixo.

| Perfil | Banco | JWT | Uso |
|---|---|---|---|
| `dev` (padrão) | H2 em memória, console em `/h2-console` | Segredo fixo de desenvolvimento | Desenvolvimento local |
| `prod` | PostgreSQL (ainda não provisionado) | `JWT_SECRET`, obrigatório | Produção |

### Perfil dev (padrão)

```powershell
.\mvnw spring-boot:run
```

Equivalente, informando o perfil de forma explícita:

```powershell
.\mvnw spring-boot:run "-Dspring-boot.run.profiles=dev"
```

O que o perfil dev entrega:

- H2 em memória (`jdbc:h2:mem:doabem`, usuário `sa`, senha vazia); os dados somem ao reiniciar.
- Console H2 em `http://localhost:8080/h2-console`.
- Segredo JWT de desenvolvimento já definido, sem variável de ambiente.
- Usuários de demonstração (senha `Doabem@123`, credenciais fictícias): `coordenador@doabem.local` (Coordenador) e `operador@doabem.local` (Operador).

### Perfil prod

O perfil prod exige estas variáveis de ambiente, sem valor padrão. Se alguma faltar, a aplicação não sobe:

| Variável | Descrição |
|---|---|
| `DB_URL` | URL JDBC, por exemplo `jdbc:postgresql://localhost:5432/doabem` |
| `DB_USERNAME` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `JWT_SECRET` | Segredo do token, com no mínimo 32 caracteres |

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/doabem"
$env:DB_USERNAME = "doabem"
$env:DB_PASSWORD = "senha"
$env:JWT_SECRET = "um-segredo-com-no-minimo-32-caracteres"

.\mvnw spring-boot:run "-Dspring-boot.run.profiles=prod"
```

No PowerShell o argumento `-D...` precisa ficar entre aspas, senão o ponto quebra o parâmetro. No Git Bash use `export VAR=valor` no lugar de `$env:VAR = "valor"`.

Observações do prod:

- Console H2 desativado e nenhum usuário de demonstração é criado.
- `ddl-auto=validate`: o Hibernate não cria nem altera tabelas. Enquanto não houver migrations (Flyway), o schema precisa existir no banco.
- O PostgreSQL ainda não existe no projeto; o perfil está preparado para quando houver.

### Pelo jar

```powershell
.\mvnw clean package
java -jar target\doabem-0.0.1-SNAPSHOT.jar                                  # dev
java -jar target\doabem-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod    # prod
```

### Pelo IntelliJ

*Run → Edit Configurations → DoabemApplication* e preencha *Active profiles* com `dev` ou `prod`. As variáveis do prod entram em *Environment variables*.

### Conferir o perfil ativo

O log de inicialização mostra `The following 1 profile is active: "dev"` (ou `"prod"`).

### Swagger (documentação da API)

Disponível só no perfil `dev`, sem exigir token:

- Interface: `http://localhost:8080/swagger-ui.html`
- JSON OpenAPI: `http://localhost:8080/v3/api-docs`

Para testar rotas protegidas:

1. Em `POST /api/auth/login`, clique em *Try it out* e use `coordenador@doabem.local` / `Doabem@123`.
2. Copie o `accessToken` da resposta.
3. Clique em *Authorize* (cadeado, no topo), cole só o token (sem o prefixo `Bearer`) e confirme.
4. As demais rotas passam a enviar o token. Entre com o Operador (`operador@doabem.local`) para ver o 403 nas rotas exclusivas do Coordenador, como `/api/users`.

No perfil `prod` o Swagger fica desativado.

## Estrutura do código

Uma pasta por entidade (ou por funcionalidade, quando não há entidade própria). Dentro de cada uma, só as camadas que ela usa: `controller`, `dto`, `entity`, `repository` e `service`. A regra de negócio fica só no `service`.

```
backend/doabem/src/main/java/br/univille/doabem/
├── auth/             login e usuário logado (controller, dto, service)
├── user/             usuários internos (controller, dto, entity, repository, service)
├── beneficiary/      famílias/beneficiários (controller, dto, entity, repository, service)
├── category/         categorias (controller, dto, entity, repository, service)
├── item/             itens e unidade de medida (controller, dto, entity, repository, service)
├── donationentry/    entrada de doação e seus itens (controller, dto, entity, repository, service)
├── stockmovement/    movimentações de estoque (entity, repository)
├── common/           Status compartilhado e erros padronizados (error/)
└── config/           segurança, JWT, OpenAPI e dados de demonstração
```

Para cada nova entidade, crie a pasta com o nome dela e as camadas necessárias. Os testes espelham os pacotes em `src/test/java`.

Previstas conforme o DER, ainda não criadas: saldo, ajuste e estorno (completam `stockmovement/`), `airequest/` (solicitação, aprovação, separação e entrega, com seus itens), `delivery/` e `dashboard/` (indicadores e históricos, sem entidade própria).

## Referências

- Requisitos: `docs/requisitos.md`
- DER: `docs/der/der.md`
- Arquitetura: `docs/arquitetura.md`
