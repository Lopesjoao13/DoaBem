# DoaBem

Sistema de Gestão de Doações e Distribuição de Recursos - Fábrica de Software P05 (UNIVILLE, Engenharia de Software, 2º bimestre 2026).

## Objetivo

Sistema web para registrar doações materiais, controlar estoque por categoria e organizar a distribuição dos recursos a beneficiários de forma rastreável. O saldo de estoque é sempre derivado das movimentações, nunca digitado.

## Integrantes

| Integrante | Responsabilidade primária |
|---|---|
| João Miguel Zazula Lopes | Coordenação / Requisitos + Backend |
| Gabriel Hardt | Frontend / UX |
| Eduardo Angeli | Dados + Backend |
| Kaue Dylon Pereira Bruch | Backend / Security |
| Vitor Viebranz Domingos | QA / DevOps / Documentação |

Cliente, Product Owner e Tech Lead acadêmico: Prof. Sestito (@profesestito).

## Stack (proposta, a confirmar pelo grupo)

| Camada | Tecnologia |
|---|---|
| Backend | Java 21 + Spring Boot 3.x (obrigatório) |
| Persistência | Spring Data JPA / Hibernate |
| Banco | PostgreSQL (proposta; ver `docs/arquitetura.md`) |
| Segurança | Spring Security |
| Validação | Jakarta Bean Validation |
| API | REST/JSON, documentada com OpenAPI/Swagger |
| Frontend | A definir (ver `docs/arquitetura.md`) |
| Testes | JUnit 5 + Mockito |

Arquitetura: monólito modular em camadas (Frontend → API REST → Controllers → Services → Repositories → Banco).

## Estrutura do repositório

```
doabem/
├── .github/pull_request_template.md
├── .gitignore
├── .env.example                   exemplo das variáveis do Docker (copie para .env)
├── docker-compose.yml             sobe banco, backend e frontend
├── README.md
├── backend/                       Java 21 + Spring Boot (Sprint 02); Dockerfile em backend/doabem
├── frontend/                      interface web (Sprint 02); Dockerfile e nginx.conf aqui
└── docs/
    ├── requisitos.md              requisitos, regras, critérios de aceite
    ├── arquitetura.md             contexto, camadas, stack e decisões técnicas (Mermaid)
    ├── decisoes.md                decisões do PO, técnicas e dúvidas
    ├── checklist-aceite.md        Definition of Done da Sprint 01
    ├── pr-descricao.md            texto do Pull Request da sprint
    ├── der/der.md                 DER em Mermaid, dicionário e restrições
    └── mockups/
        ├── fluxo-telas.md         navegação (Mermaid) e identidade visual
        ├── prototipo.md           capturas reais do protótipo e guia de identidade visual
        ├── img/                   imagens das capturas
        └── revisao-prototipo.md   revisão do protótipo (Figma/Lovable) contra os requisitos
```

## Como navegar pela documentação

- `docs/requisitos.md`: requisitos funcionais, regras de negócio, requisitos não funcionais, critérios de aceite e dúvidas.
- `docs/arquitetura.md`: stack, visão da arquitetura e justificativas.
- `docs/decisoes.md`: decisões tomadas, dúvidas resolvidas e pendências para o PO/Tech Lead.
- `docs/mockups/`: fluxo de telas e mockups de baixa fidelidade.
- `docs/der/der.md`: DER em Mermaid, dicionário de dados, cardinalidades e restrições.
- `docs/checklist-aceite.md`: Definition of Done da Sprint 01.

## Fluxo de trabalho Git

- `main`: versão estável/revisada. Sem commits diretos após a configuração inicial.
- `develop`: integração do trabalho da equipe.
- `feature/<descricao>`: entregas específicas (ex.: `feature/der-inicial`).
- Todo Pull Request exige revisão de pelo menos outro integrante.

## Como executar

Um único comando sobe três serviços (PostgreSQL, backend e frontend), já configurados e com usuários de demonstração. Funciona igual no Linux, macOS e Windows. Não é preciso instalar Java, Node, Maven nem PostgreSQL, e **não há chave SSH, token ou login** a configurar: o repositório é público e as imagens usadas (Node, Maven, Java e PostgreSQL) são baixadas do Docker Hub sem conta.

### Pré-requisitos

| Sistema | O que instalar |
|---|---|
| Windows 10/11 | [Docker Desktop](https://www.docker.com/products/docker-desktop/). Abra-o e espere o status "Engine running" antes de começar. Veja [Windows](#windows-wsl-hyper-v-e-git) abaixo. |
| macOS | [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Intel ou Apple Silicon). |
| Linux | Docker Engine e o plugin Compose v2: `curl -fsSL https://get.docker.com \| sh` e, para não usar `sudo`, `sudo usermod -aG docker $USER` (depois feche e abra o terminal). |

Também é preciso o Git, cerca de 3 GB livres em disco e a porta **8080** livre. Confira o Docker com:

```bash
docker --version
docker compose version
```

#### Windows: WSL, Hyper-V e Git

- **Não é preciso instalar o WSL, o Ubuntu nem abrir terminal Linux.** O Docker Desktop precisa de uma VM Linux por baixo (os containers do projeto são Linux) e a cria sozinho, usando o recurso **WSL 2** do Windows (padrão, serve para qualquer edição) ou o **Hyper-V** (só Windows Pro, Enterprise ou Education). O instalador ativa o recurso; peça para reiniciar se ele pedir.
- Todos os comandos do passo a passo rodam em um **PowerShell comum** (não precisa ser administrador), dentro da pasta do projeto.
- A virtualização precisa estar habilitada na BIOS. Para conferir, abra o Gerenciador de Tarefas, aba Desempenho, CPU: deve aparecer "Virtualização: Habilitado". Se o Docker Desktop não chegar a "Engine running", o motivo mais comum é este.
- O Docker Desktop deve ficar em modo de **containers Linux** (padrão). Se o ícone da bandeja oferecer "Switch to Linux containers", use essa opção: o modo de containers do Windows não roda as imagens do projeto.
- **Sem Git:** na página do repositório no GitHub, use *Code*, *Download ZIP*, extraia e abra o PowerShell dentro da pasta extraída (em vez de `git clone` e `cd DoaBem`).

### Passo a passo

**1. Clonar o projeto** (Linux, macOS e Windows):

```bash
git clone https://github.com/Lopesjoao13/DoaBem.git
cd DoaBem
```

**2. Criar o arquivo `.env`** a partir do exemplo. Ele fica na raiz do projeto, ao lado do `docker-compose.yml`:

| Terminal | Comando |
|---|---|
| Linux / macOS / Git Bash | `cp .env.example .env` |
| Windows PowerShell | `Copy-Item .env.example .env` |
| Windows Prompt de Comando (cmd) | `copy .env.example .env` |

**Obrigatório: configure o `JWT_SECRET` no `.env`.** É a chave que assina os tokens de login e precisa ser um segredo seu, com no mínimo 32 caracteres. Gere um valor aleatório com o comando do seu terminal:

| Terminal | Comando para gerar o segredo |
|---|---|
| Linux / macOS / Git Bash | `openssl rand -base64 48` |
| Windows PowerShell | `$b = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)` |

O comando imprime uma linha de texto, por exemplo `Qk3...==`. Copie essa linha, abra o `.env` (`nano .env` no Linux/macOS ou `notepad .env` no Windows) e cole depois do `=`, sem aspas e sem espaços:

```env
JWT_SECRET=cole-aqui-o-texto-gerado
```

Salve o arquivo. Os demais valores do exemplo já funcionam; edite-os só se quiser mudar algo (veja [Onde alterar as configurações](#onde-alterar-as-configurações)). Se quiser, troque também `POSTGRES_PASSWORD` por uma senha sua.

**3. Subir tudo** (mesmo comando em qualquer sistema):

```bash
docker compose up --build
```

O primeiro build baixa imagens e dependências e leva alguns minutos; os próximos são rápidos. Quando o log mostrar `Started DoabemApplication`, acesse:

| O quê | Endereço |
|---|---|
| Sistema (interface web) | http://localhost:8080 |
| Swagger UI (documentação da API) | http://localhost:8080/swagger-ui.html |

No Linux, se aparecer `permission denied` ao falar com o Docker, rode com `sudo` ou conclua o `usermod` do pré-requisito.

### Usuários de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Coordenador (acesso completo) | `coordenador@doabem.local` | `Doabem@123` |
| Operador (acesso restrito) | `operador@doabem.local` | `Doabem@123` |

São credenciais fictícias, criadas só para demonstração. O sistema começa sem dados de negócio: entre como Coordenador e cadastre categorias, itens e famílias para usar as demais telas.

### Usando o Swagger

1. Em `POST /api/auth/login`, clique em *Try it out* e envie `{"email": "coordenador@doabem.local", "password": "Doabem@123"}`.
2. Copie o `accessToken` da resposta.
3. Clique em *Authorize* (cadeado, no topo), cole só o token (sem `Bearer`) e confirme.

### Comandos úteis

Os mesmos em Linux, macOS e Windows, sempre dentro da pasta do projeto:

```bash
docker compose up --build -d     # sobe em segundo plano
docker compose logs -f backend   # log do backend (use frontend ou db para os outros)
docker compose ps                # estado e saúde de cada serviço
docker compose stop              # para os containers (os dados são mantidos)
docker compose down              # remove os containers (os dados são mantidos)
docker compose down -v           # remove tudo, inclusive o banco (recomeça do zero)
```

Os dados do PostgreSQL ficam no volume `pgdata` e sobrevivem a `stop` e `down`. Só `down -v` apaga o banco.

### Onde alterar as configurações

Tudo se altera no arquivo **`.env`** (na raiz). Depois de editar, rode `docker compose up --build` de novo (se o banco já tinha sido criado com outra senha, veja a tabela de problemas).

| Variável | Padrão | Para que serve |
|---|---|---|
| `APP_PORT` | `8080` | Porta do sistema no seu computador (acesso em `http://localhost:APP_PORT`) |
| `POSTGRES_DB` | `doabem` | Nome do banco |
| `POSTGRES_USER` | `doabem` | Usuário do banco |
| `POSTGRES_PASSWORD` | `doabem_senha_local` | Senha do banco |
| `JWT_SECRET` | segredo de exemplo (**troque**, veja o passo 2) | Assinatura dos tokens (mínimo 32 caracteres) |
| `DOABEM_SEED_DEMO_USERS` | `true` | Cria os usuários de demonstração (`false` desliga) |
| `ENABLE_SWAGGER` | `true` | Liga o Swagger UI (`false` desliga) |

Para usar outra porta, por exemplo a 9090, edite no `.env` a linha `APP_PORT=9090` e acesse `http://localhost:9090`.

### Problemas comuns

| Sintoma | O que fazer |
|---|---|
| `port is already allocated` / `ports are not available` (comum no Windows com a 8080 em uso) | Mude `APP_PORT` no `.env` (por exemplo `9090`) e rode `docker compose up --build` de novo |
| `password authentication failed` depois de mudar `POSTGRES_PASSWORD` | O volume guardou a senha antiga: `docker compose down -v` e suba de novo |
| `Cannot connect to the Docker daemon` / `error during connect` | O Docker não está rodando: abra o Docker Desktop (Windows/macOS) ou `sudo systemctl start docker` (Linux) |
| `docker compose` não encontrado | Atualize o Docker/Compose v2. Em versões antigas, o comando é `docker-compose` (com hífen) |
| O primeiro build demora ou falha ao baixar | Confira a internet e tente de novo: `docker compose up --build` retoma do cache |
| `no space left on device` | Libere espaço com `docker system prune` |
| Login com "e-mail ou senha inválidos" | Use exatamente os dados da tabela acima (a senha tem `@` e diferencia maiúsculas) |
| `Engine running` não aparece no Docker Desktop (Windows) | Veja [Windows](#windows-wsl-hyper-v-e-git): habilite a virtualização na BIOS e reinicie o Docker Desktop |
| Erro de `.env` no Windows | Salve o arquivo como UTF-8 e sem extensão extra (deve se chamar `.env`, não `.env.txt`) |

### Sem Docker (desenvolvimento)

Para rodar backend e frontend separadamente, com H2 em memória e recarga automática, veja [`backend/README.md`](backend/README.md#como-executar) e [`frontend/README.md`](frontend/README.md#como-executar). Esse modo exige Java 21 e Node.js 20.19+ (ou 22.12+).

### Como a aplicação é montada

O `docker-compose.yml` sobe três serviços, cada um com seu container:

| Serviço | Imagem | Função | Porta |
|---|---|---|---|
| `db` | `postgres:16-alpine` | Banco de dados (dados no volume `pgdata`) | interna |
| `backend` | `backend/doabem/Dockerfile` (Java 21 + Spring Boot) | API REST e Swagger | interna (8080) |
| `frontend` | `frontend/Dockerfile` (React + Vite, servido pelo nginx) | Interface web; repassa `/api` e o Swagger ao backend | `APP_PORT` (padrão 8080) |

Só o `frontend` é publicado no seu computador, então tudo é acessado em um único endereço (`http://localhost:8080`) e não há problema de CORS. O `backend` espera o banco aceitar conexões antes de iniciar (e se reinicia sozinho se algo falhar), e o `frontend` encontra o backend mesmo que ele seja recriado. O esquema do banco é criado automaticamente pelo Flyway.
