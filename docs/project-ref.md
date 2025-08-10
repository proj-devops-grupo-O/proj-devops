# Projeto: Gerenciador de Assinaturas para PMEs
## Objetivo
Automatizar a cobranca e renovaco de assinaturas (mensalidades) substituindo planilhas manuais sujeitas a
erros e esquecimentos.
## Escopo: Somente Backend
---
## 1. Modelagem do Dominio (Banco de Dados)
### Entidades principais:
- **Usuario (Cliente da PME)**
 - id, nome, email, telefone
- **Plano/Assinatura**
 - id, nome, valor, recorrncia (mensal, anual), descrico
- **Assinatura Ativa**
 - id, id_cliente, id_plano, data_inicio, status, proxima_cobranca
- **Cobranca**
 - id, id_assinatura, data_cobranca, valor, status (pago, pendente, atrasado)
- **Pagamento (simulado)**
 - id, id_cobranca, data_pagamento, metodo, status
---
## 2. API RESTful
### Rotas basicas:
#### Clientes
Planejamento: Backend de Gerenciador de Assinaturas (PMEs)
- POST /clientes - cadastrar cliente
- GET /clientes/:id - ver cliente
- PUT /clientes/:id - editar cliente
- DELETE /clientes/:id - deletar
#### Planos
- GET /planos - listar planos
- POST /planos - criar plano
#### Assinaturas
- POST /assinaturas - criar assinatura
- GET /assinaturas/:id - ver assinatura
- POST /assinaturas/:id/cancelar - cancelar assinatura
#### Cobrancas
- GET /cobrancas - listar cobrancas (filtro por status ou cliente)
- POST /cobrancas/:id/pagar - simular pagamento
---
## 3. Simulador de Agendamento de Cobrança

### Funcionalidade Principal
O sistema implementa um mecanismo automatizado de agendamento de cobranças com notificações programadas.

### Fluxo de Processamento
1. **Criação da Cobrança**: Ao gerar uma nova cobrança, o sistema define automaticamente uma data de vencimento baseada na assinatura
2. **Agendamento de Jobs**: O sistema agenda jobs assíncronos para execução na data de vencimento
3. **Notificações Automatizadas**: No momento do vencimento, o sistema dispara:
   - **E-mail**: Notificação detalhada com informações da cobrança
   - **SMS**: Lembrete conciso sobre o vencimento
---
## 4. Simulaco de Notificaces
- Ao gerar uma cobranca -> simula envio de e-mail
- Ex: "Cobranca gerada para Joo R$100 - vencimento 2025-07-31"
---