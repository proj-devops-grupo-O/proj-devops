# Sistema de Gerenciamento de Cobranças

Sistema backend em **NestJS** para automatizar cobranças e renovações de assinaturas. Inclui processamento assíncrono de emails via Redis, banco PostgreSQL com Prisma ORM, e API REST para gerenciamento completo.

## 🚀 Funcionalidades

- **API REST** para gerenciamento de cobranças
- **Banco PostgreSQL** com Prisma ORM
- **Fila Redis** para processamento assíncrono de emails
- **Worker** dedicado para envio de emails
- **Docker** para ambiente de desenvolvimento

## 📋 Pré-requisitos

- **Node.js** 18+
- **Docker** & **Docker Compose**
- **npm**

## ⚡ Como Rodar

### 1. Clone e instale

```bash
git clone <url-do-repo>
cd proj-devops
npm install
```

### 2. Configure o banco

```bash
npm run db:generate
npm run db:push
```

### 3. Execute o sistema

#### Modo Automático (Recomendado)

```bash
chmod +x script/start.sh
./script/start.sh
```

#### Modo Manual

```bash
docker-compose up -d

npm run start:dev
```

#### Testes

```bash
npm test
```
