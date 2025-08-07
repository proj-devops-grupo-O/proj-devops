# 🎯 Sistema de Gerenciamento de Cobranças para PMEs

Sistema backend em **NestJS** para automatizar cobranças e renovações de assinaturas, substituindo planilhas manuais. Inclui processamento assíncrono de emails via Redis e simulação de envio de notificações.

## 🚀 Funcionalidades

- ✅ **API REST** para gerenciamento de cobranças
- ✅ **Banco PostgreSQL** com Prisma ORM
- ✅ **Fila Redis** para processamento assíncrono de emails
- ✅ **Worker** dedicado para envio de emails
- ✅ **Simulação de envio** de emails de cobrança
- ✅ **Validação** robusta com class-validator
- ✅ **Docker** para ambiente de desenvolvimento

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NestJS API    │───▶│   PostgreSQL    │    │     Redis       │
│  (Port 3000)    │    │   (Port 5432)   │    │  (Port 6379)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              ▲
         │ Adiciona jobs                                │
         ▼ na fila                                      │ Consome
┌─────────────────┐                                     │ jobs
│ Email Worker    │─────────────────────────────────────┘
│ (Background)    │
└─────────────────┘
```

## 📋 Pré-requisitos

- **Node.js** 18+ 
- **Docker** & **Docker Compose**
- **npm** ou **yarn**

## ⚡ Instalação e Execução

### 1. Clone o repositório
```bash
git clone <url-do-repo>
cd proj-devops
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env conforme necessário
```

### 3. Suba os serviços com Docker
```bash
docker-compose up -d
```

Isso irá inicializar:
- **PostgreSQL** na porta 5432
- **Redis** na porta 6379  
- **PgAdmin** na porta 8080 (opcional)

### 4. Instale as dependências
```bash
npm install
```

### 5. Configure o banco de dados
```bash
# Gerar cliente Prisma
npm run db:generate

# Sincronizar schema com o banco
npm run db:push
```

### 6. Execute a aplicação

#### 🚀 Modo Fácil (Recomendado)
```bash
# Iniciar API + Worker + Docker automaticamente
./start.sh

# Para parar tudo
./stop.sh
```

#### Modo Manual
```bash
# Terminal 1: API NestJS
npm run start:dev

# Terminal 2: Worker de email
npm run worker
```

#### Modo Produção
```bash
npm run build
npm run start:prod
```

## 📡 Endpoints da API

Base URL: `http://localhost:3000/api`

### Cobranças

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/cobrancas` | Criar nova cobrança |
| `GET` | `/cobrancas` | Listar cobranças (com filtros) |
| `GET` | `/cobrancas/:id` | Buscar cobrança por ID |
| `PATCH` | `/cobrancas/:id` | Atualizar status da cobrança |

### Exemplos de Uso

#### Criar Cobrança
```bash
curl -X POST http://localhost:3000/api/cobrancas \
  -H "Content-Type: application/json" \
  -d '{
    "assinaturaId": "assinatura_1",
    "valor": 29.90,
    "descricao": "Cobrança mensal"
  }'
```

#### Listar Cobranças
```bash
# Todas as cobranças
curl http://localhost:3000/api/cobrancas

# Filtrar por status
curl http://localhost:3000/api/cobrancas?status=pendente

# Filtrar por cliente
curl http://localhost:3000/api/cobrancas?clienteId=cliente_1
```

#### Atualizar Status
```bash
curl -X PATCH http://localhost:3000/api/cobrancas/:id \
  -H "Content-Type: application/json" \
  -d '{"status": "pago"}'
```

## 🗄️ Modelo de Dados

O sistema possui as seguintes entidades principais:

- **Cliente**: usuários que possuem assinaturas
- **Plano**: tipos de assinatura disponíveis
- **AssinaturaAtiva**: relação cliente-plano ativa
- **Cobranca**: cobranças geradas para assinaturas
- **Pagamento**: registros de pagamentos de cobranças

### Dados de Exemplo

O sistema inclui dados pré-populados:
- 3 clientes de exemplo
- 3 planos (Básico, Premium, Anual)
- 3 assinaturas ativas

## 📧 Sistema de Emails

### Como Funciona

1. **Criação de Cobrança**: API gera cobrança e adiciona job na fila Redis
2. **Worker Background**: Processa jobs da fila `email_queue`
3. **Envio de Email**: Simula envio (logs no console) + tentativa real se configurado

### Configuração de Email Real

Para enviar emails reais, configure no `.env`:

```env
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=seu-email@gmail.com
EMAIL_SMTP_PASS=sua-senha-app
EMAIL_FROM=sistema@suaempresa.com
```

## 🔧 Scripts Disponíveis

### 🚀 Scripts Principais
```bash
./start.sh                 # 🌟 Iniciar sistema completo
./stop.sh                  # 🛑 Parar sistema completo
```

### 📦 Scripts NPM
```bash
# Desenvolvimento
npm run start:dev          # API com hot-reload
npm run worker             # Worker de email

# Produção
npm run build              # Build da aplicação
npm run start:prod         # API em produção

# Banco de dados
npm run db:generate        # Gerar cliente Prisma
npm run db:push           # Sincronizar schema
npm run db:studio         # Interface web do Prisma

# Testes
npm run test              # Testes unitários
npm run test:e2e          # Testes end-to-end
npm run test:cov          # Coverage de testes
```

## 🐳 Docker

### Serviços Inclusos

- **PostgreSQL 15** com dados de exemplo
- **Redis 7** para filas
- **PgAdmin 4** para administração do banco

### Comandos Úteis

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Resetar volumes (⚠️ perde dados)
docker-compose down -v
```

## 🧪 Testando o Sistema

### 1. Verificar Conexões
```bash
# PostgreSQL
docker-compose logs postgres

# Redis
docker-compose logs redis
```

### 2. Testar API
```bash
# Health check
curl http://localhost:3000/api/cobrancas

# Criar cobrança de teste
curl -X POST http://localhost:3000/api/cobrancas \
  -H "Content-Type: application/json" \
  -d '{
    "assinaturaId": "assinatura_1", 
    "valor": 50.00
  }'
```

### 3. Verificar Worker
- Execute `npm run worker`
- Crie uma cobrança via API
- Observe os logs do worker processando o email

## 🏛️ Estrutura do Projeto

```
src/
├── cobrancas/           # Módulo de cobranças
│   ├── dto/            # Data Transfer Objects
│   ├── cobrancas.controller.ts
│   ├── cobrancas.service.ts
│   └── cobrancas.module.ts
├── prisma/             # Configuração Prisma
├── redis/              # Configuração Redis
├── services/           # Serviços utilitários
├── worker/             # Worker de background
├── app.module.ts       # Módulo raiz
└── main.ts            # Entry point
```

## 🔍 Monitoramento

### PgAdmin (Interface PostgreSQL)
- URL: http://localhost:8080
- Email: admin@admin.com
- Senha: admin123

### Logs da Aplicação
```bash
# API
npm run start:dev

# Worker
npm run worker

# Docker services
docker-compose logs -f
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com PostgreSQL
```bash
# Verificar se container está rodando
docker-compose ps

# Restart do serviço
docker-compose restart postgres
```

#### 2. Erro no Prisma
```bash
# Regenerar cliente
npm run db:generate

# Reset do banco (⚠️ perde dados)
docker-compose down -v
docker-compose up -d
npm run db:push
```

#### 3. Redis não conecta
```bash
# Verificar Redis
docker-compose logs redis
docker-compose restart redis
```

## 📈 Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] Adicionar testes automatizados
- [ ] Implementar retry policies para emails
- [ ] Dashboard web para visualização
- [ ] Webhook para notificações de pagamento
- [ ] Métricas e monitoramento

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido com ❤️ usando NestJS, Prisma, PostgreSQL e Redis** 