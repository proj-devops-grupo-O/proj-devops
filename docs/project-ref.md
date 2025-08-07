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
## 3. Simulador de Agendamento de Cobranca
- Script que roda diariamente (ou manualmente):
 - Percorre assinaturas ativas
 - Gera nova cobranca se hoje >= proxima_cobranca
 - Atualiza proxima_cobranca para o ms seguinte
---
## 4. Simulaco de Notificaces
- Ao gerar uma cobranca -> simula envio de e-mail
- Ex: "Cobranca gerada para Joo R$100 - vencimento 2025-07-31"
---