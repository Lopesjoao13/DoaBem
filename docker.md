# Executando o DoaBem com Docker

Este guia explica como instalar o Docker, construir a imagem e executar o DoaBem em **um único container**, com Frontend, Backend (Spring Boot) e PostgreSQL juntos.

## Como funciona

O build do frontend (Vite/React) é embutido dentro do `.jar` do Spring Boot, que o serve na mesma porta da API. Um único container roda dois processos, gerenciados pelo `supervisord`:

| Processo | Função |
|---|---|
| PostgreSQL 16 | Banco de dados |
| Spring Boot (Java 21) | API + Frontend |

Acesse tudo em `http://localhost:8080`.

## 1. Pré-requisitos

- Docker instalado e em execução
- Git
- Conexão com a internet no primeiro build (baixa imagens e dependências)
- Cerca de 3 GB livres em disco e 4 GB de RAM disponíveis

### Instalando o Docker

**Windows / macOS**
1. Baixe o [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. No Windows, mantenha o backend **WSL 2** ativado durante a instalação.
3. Abra o Docker Desktop e aguarde o status "Engine running".

**Linux (Ubuntu/Debian)**

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Feche e abra o terminal novamente para o grupo `docker` valer.


## 2. Obtendo o projeto

```bash
git clone https://github.com/Lopesjoao13/DoaBem.git
cd DoaBem
```

## 3. Arquivos necessários na raiz do projeto

```
DoaBem/
├── Dockerfile
├── supervisord.conf
├── .dockerignore
├── .env
├── backend/
└── frontend/
```

### Criando o `.env`

```env
# Usadas pelo Spring (nomes definidos no application-prod.properties)
DB_URL=jdbc:postgresql://localhost:5432/doabem
DB_USERNAME=doabem
DB_PASSWORD=troque_esta_senha

# Usadas pelo PostgreSQL (criam o banco e o usuário na primeira execução)
POSTGRES_DB=doabem
POSTGRES_USER=doabem
POSTGRES_PASSWORD=troque_esta_senha

# Perfil do Spring
SPRING_PROFILES_ACTIVE=prod

# Chave de assinatura dos tokens JWT (mínimo 32 caracteres)
JWT_SECRET=troque-por-uma-chave-aleatoria-com-mais-de-32-caracteres
```

Regras importantes:

- `DB_USERNAME` deve ser igual a `POSTGRES_USER`.
- `DB_PASSWORD` deve ser igual a `POSTGRES_PASSWORD`.
- O banco no final da `DB_URL` deve ser igual a `POSTGRES_DB`.
- O host é `localhost` porque o banco roda dentro do mesmo container.
- Sem aspas, sem espaços em volta do `=` e sem valores vazios. Uma variável vazia sobrescreve os valores padrão e quebra a inicialização.

Para gerar uma chave JWT aleatória:

```bash
openssl rand -base64 48
```

> **Segurança:** não versione o `.env`. Adicione-o ao `.gitignore`.

## 4. Construindo a imagem

Na raiz do projeto (onde está o `Dockerfile`):

```bash
docker build -t doabem .
```

O primeiro build leva alguns minutos, pois baixa imagens base e dependências (Node, Maven e Debian). Os seguintes são mais rápidos graças ao cache.

Confirme que a imagem foi criada:

```bash
docker images
```

## 5. Executando o container

```bash
docker run -d --name doabem \
  --env-file .env \
  -p 8080:8080 \
  -p 127.0.0.1:5432:5432 \
  -v pgdata:/var/lib/postgresql/data \
  doabem
```

Se a porta 5432 já estiver em uso (Postgres instalado na máquina), use `-p 127.0.0.1:5433:5432` e conecte na 5433.

## 6. Observações

- **Rede:** sem o `-p 127.0.0.1:5432:5432`, o PostgreSQL fica acessível apenas para a aplicação, dentro do container.
- **Chaves e senhas:** use valores diferentes em cada ambiente e nunca as inclua no repositório.