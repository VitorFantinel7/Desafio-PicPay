# 🎤 ROTEIRO DE APRESENTAÇÃO - PicPay Simplificado

> **Tempo estimado:** 20-30 minutos
> **Dica:** Leia este documento várias vezes antes da entrevista e pratique em voz alta!

---

## 📋 ÍNDICE DO ROTEIRO

1. [Introdução e Contexto](#1-introdução-e-contexto-2-minutos)
2. [Demonstração Rápida](#2-demonstração-rápida-3-minutos)
3. [Arquitetura do Projeto](#3-arquitetura-do-projeto-5-minutos)
4. [Explicação do Código](#4-explicação-do-código-10-minutos)
5. [Testes](#5-testes-3-minutos)
6. [Docker e Infraestrutura](#6-docker-e-infraestrutura-2-minutos)
7. [Melhorias Futuras](#7-melhorias-futuras-2-minutos)
8. [Perguntas Frequentes](#8-perguntas-frequentes)
9. [Comandos Úteis](#9-comandos-úteis-para-demonstração)

---

## 1. INTRODUÇÃO E CONTEXTO (2 minutos)

### O que falar:

> "Desenvolvi uma API RESTful de transferências bancárias simplificada. O sistema permite que usuários comuns façam transferências entre si e para lojistas, enquanto lojistas apenas recebem valores."

### Requisitos implementados (mencione todos):

| Requisito | Status | Como implementei |
|-----------|--------|------------------|
| CPF/CNPJ e email únicos | ✅ | Constraint `@unique` no Prisma |
| Usuários transferem entre si e para lojistas | ✅ | Validação no Service |
| Lojistas só recebem | ✅ | Verifico `userType === 'MERCHANT'` |
| Validar saldo antes de transferir | ✅ | Comparo `balance` com `value` |
| Consultar serviço autorizador externo | ✅ | Chamada HTTP com Axios |
| Transferência transacional (rollback) | ✅ | `prisma.$transaction()` |
| Notificação ao recebedor | ✅ | Chamada assíncrona com Axios |
| API RESTful | ✅ | Express com rotas organizadas |

### Tecnologias escolhidas (justifique):

> "Escolhi as seguintes tecnologias:"

| Tecnologia | Por que escolhi |
|------------|-----------------|
| **Node.js + Express** | Framework minimalista, flexível e com grande comunidade |
| **Prisma** | ORM moderno, type-safe, com migrations automáticas |
| **PostgreSQL** | Banco robusto, suporta transações ACID |
| **Jest** | Framework de testes mais popular do ecossistema Node |
| **Docker** | Facilita rodar em qualquer ambiente |

---

## 2. DEMONSTRAÇÃO RÁPIDA (3 minutos)

### Passo 1: Mostrar que a aplicação está rodando

```bash
# Verificar se está rodando
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "message": "API PicPay Simplificado está funcionando!"
}
```

### Passo 2: Listar usuários disponíveis

```bash
curl http://localhost:3000/users
```

> "Temos 4 usuários de teste: 2 comuns (João e Maria) e 2 lojistas (Loja do Pedro e Mercado da Ana)"

### Passo 3: Fazer uma transferência com SUCESSO

```bash
curl -X POST http://localhost:3000/transfer \
  -H "Content-Type: application/json" \
  -d '{"value": 100, "payer": 1, "payee": 3}'
```

> "Aqui o João (ID 1) está transferindo R$ 100 para a Loja do Pedro (ID 3)"

### Passo 4: Mostrar erro - Lojista tentando transferir

```bash
curl -X POST http://localhost:3000/transfer \
  -H "Content-Type: application/json" \
  -d '{"value": 50, "payer": 3, "payee": 1}'
```

> "Veja que o lojista (ID 3) não consegue transferir - retorna erro 400"

### Passo 5: Mostrar erro - Saldo insuficiente

```bash
curl -X POST http://localhost:3000/transfer \
  -H "Content-Type: application/json" \
  -d '{"value": 999999, "payer": 1, "payee": 2}'
```

> "Aqui tentamos transferir um valor maior que o saldo - retorna erro de saldo insuficiente"

---

## 3. ARQUITETURA DO PROJETO (5 minutos)

### Diagrama para desenhar/mostrar:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                 │
│                   (Postman, cURL, Frontend)                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP Request
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ROUTES                                  │
│                  (Define os endpoints)                          │
│         POST /transfer  │  GET /users  │  GET /health           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CONTROLLERS                               │
│              (Recebe request, retorna response)                 │
│                                                                 │
│  • Extrai dados do body                                         │
│  • Valida campos obrigatórios                                   │
│  • Chama o Service                                              │
│  • Retorna JSON                                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVICES                                 │
│               (LÓGICA DE NEGÓCIO - CORAÇÃO)                     │
│                                                                 │
│  • Valida regras de negócio                                     │
│  • Lojista não pode transferir                                  │
│  • Verifica saldo                                               │
│  • Chama autorizador externo                                    │
│  • Orquestra a operação                                         │
└───────────┬─────────────────┴───────────────┬───────────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────────────┐
│     REPOSITORIES      │         │     SERVIÇOS EXTERNOS         │
│  (Acesso ao banco)    │         │                               │
│                       │         │  • Authorization Service      │
│  • findById()         │         │  • Notification Service       │
│  • create()           │         │                               │
│  • executeTransfer()  │         │  (Chamadas HTTP com Axios)    │
└───────────┬───────────┘         └───────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       POSTGRESQL                                │
│                    (Banco de Dados)                             │
│                                                                 │
│    ┌──────────┐              ┌──────────────┐                   │
│    │  users   │──────────────│  transfers   │                   │
│    └──────────┘              └──────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

### O que falar sobre a arquitetura:

> "Usei uma arquitetura em camadas que segue o princípio de **Separação de Responsabilidades** (SoC). Cada camada tem uma única função:"

1. **Routes** → Define ONDE (URLs)
2. **Controllers** → Define O QUE receber e retornar
3. **Services** → Define COMO (regras de negócio)
4. **Repositories** → Define ONDE buscar/salvar dados

### Benefícios desta arquitetura:

> "Essa arquitetura traz vários benefícios:"

| Benefício | Explicação |
|-----------|------------|
| **Testabilidade** | Posso testar cada camada isoladamente com mocks |
| **Manutenibilidade** | Se mudar o banco, só altero o Repository |
| **Escalabilidade** | Posso adicionar novas features sem afetar outras |
| **Clareza** | Fácil entender onde cada código está |

---

## 4. EXPLICAÇÃO DO CÓDIGO (10 minutos)

### 4.1 Estrutura de Pastas

```
src/
├── app.js              # Configuração do Express
├── server.js           # Ponto de entrada
├── routes/             # Definição das rotas
├── controllers/        # Controladores HTTP
├── services/           # Lógica de negócio ⭐
├── repositories/       # Acesso ao banco
├── middlewares/        # Tratamento de erros
├── errors/             # Classe de erro customizada
└── database/           # Conexão com Prisma
```

### 4.2 Fluxo Completo de uma Transferência

> "Vou explicar passo a passo o que acontece quando uma requisição de transferência chega:"

```
REQUISIÇÃO: POST /transfer { value: 100, payer: 1, payee: 3 }

PASSO 1 - ROUTE
  └─▶ Recebe em POST /transfer
  └─▶ Encaminha para transferController.create()

PASSO 2 - CONTROLLER
  └─▶ Extrai { value, payer, payee } do body
  └─▶ Valida se campos existem
  └─▶ Chama transferService.execute()

PASSO 3 - SERVICE (onde a mágica acontece)
  └─▶ Valida: valor > 0
  └─▶ Valida: payer ≠ payee
  └─▶ Busca payer no banco
  └─▶ Busca payee no banco
  └─▶ Valida: payer NÃO é lojista
  └─▶ Valida: payer tem saldo suficiente
  └─▶ Consulta serviço autorizador externo
  └─▶ Executa transferência (TRANSAÇÃO)
  └─▶ Envia notificação (assíncrono)

PASSO 4 - REPOSITORY
  └─▶ Inicia transação no banco
  └─▶ Debita do payer (UPDATE balance - value)
  └─▶ Credita no payee (UPDATE balance + value)
  └─▶ Insere registro na tabela transfers
  └─▶ Commit da transação

PASSO 5 - RESPOSTA
  └─▶ Retorna 201 Created com dados da transferência
```

### 4.3 O Service de Transferência (arquivo mais importante)

> "Este é o coração do sistema. Vou mostrar cada validação:"

```javascript
// src/services/transfer.service.js

async execute({ value, payerId, payeeId }) {
  
  // ═══════════════════════════════════════════════════
  // VALIDAÇÃO 1: Valor deve ser positivo
  // ═══════════════════════════════════════════════════
  if (!value || value <= 0) {
    throw new AppError('O valor deve ser maior que zero');
  }
  // Por que? Evita transferências de R$ 0 ou valores negativos

  // ═══════════════════════════════════════════════════
  // VALIDAÇÃO 2: Não pode transferir para si mesmo
  // ═══════════════════════════════════════════════════
  if (payerId === payeeId) {
    throw new AppError('Não é possível transferir para você mesmo');
  }
  // Por que? Não faz sentido e poderia ser explorado

  // ═══════════════════════════════════════════════════
  // VALIDAÇÃO 3: Usuários devem existir
  // ═══════════════════════════════════════════════════
  const payer = await userRepository.findById(payerId);
  if (!payer) {
    throw new AppError('Usuário pagador não encontrado', 404);
  }

  const payee = await userRepository.findById(payeeId);
  if (!payee) {
    throw new AppError('Usuário recebedor não encontrado', 404);
  }

  // ═══════════════════════════════════════════════════
  // VALIDAÇÃO 4: Lojista não pode transferir
  // ═══════════════════════════════════════════════════
  if (payer.userType === 'MERCHANT') {
    throw new AppError('Lojistas não podem realizar transferências');
  }
  // Por que? Regra de negócio do PicPay

  // ═══════════════════════════════════════════════════
  // VALIDAÇÃO 5: Deve ter saldo suficiente
  // ═══════════════════════════════════════════════════
  if (Number(payer.balance) < value) {
    throw new AppError('Saldo insuficiente');
  }
  // Por que? Não pode transferir mais do que tem

  // ═══════════════════════════════════════════════════
  // VALIDAÇÃO 6: Serviço autorizador externo
  // ═══════════════════════════════════════════════════
  await authorizationService.authorize();
  // Por que? Simula um sistema antifraude

  // ═══════════════════════════════════════════════════
  // EXECUÇÃO: Transferência transacional
  // ═══════════════════════════════════════════════════
  const result = await transferRepository.executeTransfer(
    payerId, payeeId, value
  );

  // ═══════════════════════════════════════════════════
  // PÓS-EXECUÇÃO: Notificação assíncrona
  // ═══════════════════════════════════════════════════
  notificationService.notifyTransferReceived(payee, value, payer.fullName)
    .catch(err => console.error('Erro:', err));
  // Por que assíncrono? Não bloqueia a resposta

  return result;
}
```

### 4.4 Transação no Banco de Dados

> "A transferência é executada dentro de uma **transação**. Isso é crucial para garantir consistência:"

```javascript
// src/repositories/transfer.repository.js

async executeTransfer(payerId, payeeId, value) {
  // $transaction = TUDO acontece ou NADA acontece
  return prisma.$transaction(async (tx) => {
    
    // 1️⃣ Debita do pagador
    const payer = await tx.user.update({
      where: { id: payerId },
      data: { balance: { decrement: value } }
    });

    // 2️⃣ Credita no recebedor
    const payee = await tx.user.update({
      where: { id: payeeId },
      data: { balance: { increment: value } }
    });

    // 3️⃣ Registra a transferência
    const transfer = await tx.transfer.create({
      data: { value, payerId, payeeId }
    });

    return { transfer, payer, payee };
  });
}
```

> "Se qualquer etapa falhar, o banco faz **rollback automático**. Isso evita situações onde o dinheiro é debitado mas não creditado."

### 4.5 Tratamento de Erros

> "Criei uma classe de erro customizada e um middleware global:"

```javascript
// src/errors/AppError.js
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;  // Permite definir código HTTP
    this.isOperational = true;     // Diferencia de bugs
  }
}

// src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Erros esperados (AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  
  // Erros inesperados (bugs)
  return res.status(500).json({ error: 'Erro interno' });
};
```

> "Isso centraliza o tratamento de erros em um único lugar e padroniza as respostas."

---

## 5. TESTES (3 minutos)

### Rodar os testes ao vivo:

```bash
npm test
```

### Tipos de testes implementados:

| Tipo | Arquivo | O que testa |
|------|---------|-------------|
| **Unitário** | `transfer.service.test.js` | Lógica de negócio isolada |
| **Integração** | `transfer.api.test.js` | Endpoints HTTP |

### Cenários cobertos nos testes unitários:

```javascript
✓ deve realizar uma transferência com sucesso
✓ deve rejeitar transferência com valor zero ou negativo
✓ deve rejeitar transferência para si mesmo
✓ deve rejeitar quando pagador não existe
✓ deve rejeitar quando recebedor não existe
✓ deve rejeitar transferência de lojista
✓ deve rejeitar quando saldo é insuficiente
✓ deve rejeitar quando autorizador nega
✓ deve completar transferência mesmo se notificação falhar
```

### Explicar o conceito de Mock:

> "Nos testes unitários, uso **mocks** para simular as dependências. Isso permite testar o Service sem precisar do banco de dados real:"

```javascript
// Mock do repository - simula o banco
userRepository.findById.mockResolvedValue({
  id: 1,
  balance: 1000,
  userType: 'COMMON'
});

// Agora posso testar o service isoladamente
```

---

## 6. DOCKER E INFRAESTRUTURA (2 minutos)

### Mostrar os arquivos:

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: picpay
      
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
```

### O que falar:

> "Usei Docker para facilitar a execução do projeto. Com um único comando `docker-compose up`, sobe o banco PostgreSQL e a aplicação. Isso garante que o ambiente será igual em qualquer máquina."

### Benefícios do Docker:

- ✅ Ambiente consistente (funciona igual na minha máquina e na sua)
- ✅ Fácil de subir e derrubar
- ✅ Isolamento de dependências
- ✅ Simula ambiente de produção

---

## 7. MELHORIAS FUTURAS (2 minutos)

> "Se tivesse mais tempo, implementaria:"

| Melhoria | Por que é importante |
|----------|---------------------|
| **Autenticação JWT** | Proteger endpoints, identificar usuário |
| **Rate Limiting** | Evitar abuso da API |
| **Cache com Redis** | Melhorar performance |
| **Mensageria (RabbitMQ)** | Notificações mais robustas |
| **CI/CD** | Deploy automatizado |
| **Logs estruturados** | Facilitar debugging em produção |
| **Swagger** | Documentação interativa da API |
| **Hash de senha** | Segurança (usar bcrypt) |

---

## 8. PERGUNTAS FREQUENTES

### ❓ "Por que você separou em tantas camadas?"

> "Para seguir o princípio de **Separação de Responsabilidades**. Cada camada tem uma única função. Isso facilita testes, manutenção e entendimento do código. Se eu precisar mudar o banco de dados, só altero o Repository, sem mexer nas outras camadas."

---

### ❓ "Por que usar transação no banco?"

> "Para garantir **atomicidade**. Numa transferência, preciso debitar de um usuário e creditar em outro. Se o sistema cair no meio, sem transação, o dinheiro poderia 'desaparecer'. Com transação, ou tudo acontece ou nada acontece - o banco faz rollback automático em caso de falha."

---

### ❓ "E se o serviço de notificação falhar?"

> "A notificação é **assíncrona** e **não bloqueia** a transferência. Se falhar, a transferência já foi concluída com sucesso. Apenas logamos o erro. Em produção, poderíamos usar uma fila de mensagens (RabbitMQ/Kafka) para garantir a entrega."

---

### ❓ "Por que escolheu Prisma e não outro ORM?"

> "O Prisma é moderno, tem excelente documentação e é **type-safe**. Ele gera tipos automaticamente, o que evita erros. Também tem migrations automáticas e um query builder intuitivo."

---

### ❓ "Como você garante que CPF/email são únicos?"

> "Defini constraints `@unique` no schema do Prisma. Isso cria índices únicos no banco de dados. Se alguém tentar cadastrar um CPF duplicado, o banco rejeita automaticamente."

---

### ❓ "Por que usar Express e não NestJS/Fastify?"

> "Escolhi Express por ser minimalista e me dar mais controle. Para um projeto deste tamanho, não precisava da estrutura opinada do NestJS. Express é mais simples de entender e explicar."

---

### ❓ "Como os testes funcionam sem o banco?"

> "Uso **mocks** do Jest para simular as respostas do banco. Isso permite testar a lógica de negócio isoladamente, sem depender de infraestrutura externa. Os testes rodam mais rápido e são mais previsíveis."

---

### ❓ "O que acontece se o autorizador externo estiver fora?"

> "Defini um **timeout de 5 segundos** na chamada. Se exceder ou falhar, lanço um erro `503 Service Unavailable`. A transferência não é completada, protegendo o usuário."

---

### ❓ "Como você trataria milhares de requisições simultâneas?"

> "Algumas estratégias:
> 1. **Cache** - Redis para consultas frequentes
> 2. **Load Balancer** - Distribuir entre várias instâncias
> 3. **Connection Pooling** - Prisma já faz isso
> 4. **Índices no banco** - Já tenho em CPF e email
> 5. **Rate Limiting** - Limitar requisições por IP"

---

### ❓ "Por que não usou TypeScript?"

> "Para simplificar, já que o desafio não exigia. Em produção, usaria TypeScript pelos benefícios de tipagem estática. O Prisma inclusive gera tipos automaticamente."

---

## 9. COMANDOS ÚTEIS PARA DEMONSTRAÇÃO

### Iniciar a aplicação:

```bash
# Com Docker
docker-compose up -d

# Sem Docker
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### Testar endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Listar usuários
curl http://localhost:3000/users

# Listar transferências
curl http://localhost:3000/transfer

# Fazer transferência (sucesso)
curl -X POST http://localhost:3000/transfer \
  -H "Content-Type: application/json" \
  -d '{"value": 100, "payer": 1, "payee": 3}'

# Erro: lojista transferindo
curl -X POST http://localhost:3000/transfer \
  -H "Content-Type: application/json" \
  -d '{"value": 50, "payer": 3, "payee": 1}'

# Erro: saldo insuficiente
curl -X POST http://localhost:3000/transfer \
  -H "Content-Type: application/json" \
  -d '{"value": 999999, "payer": 1, "payee": 2}'

# Erro: transferir para si mesmo
curl -X POST http://localhost:3000/transfer \
  -H "Content-Type: application/json" \
  -d '{"value": 100, "payer": 1, "payee": 1}'
```

### Rodar testes:

```bash
# Todos os testes
npm test

# Com cobertura detalhada
npm test -- --coverage

# Apenas testes unitários
npm test -- --testPathPattern=unit
```

### Ver logs do Docker:

```bash
docker-compose logs -f app
```

---

## 📝 CHECKLIST ANTES DA ENTREVISTA

- [ ] Aplicação rodando localmente
- [ ] Testei todos os endpoints
- [ ] Revisei este roteiro
- [ ] Pratiquei as respostas das perguntas
- [ ] Docker funcionando
- [ ] Testes passando
- [ ] Código aberto no VS Code para mostrar

---

## 💡 DICAS FINAIS

1. **Seja confiante** - Você construiu isso, conhece cada linha
2. **Admita o que não sabe** - "Não implementei X, mas faria assim..."
3. **Explique seu raciocínio** - O processo importa mais que o resultado
4. **Faça perguntas** - Mostra interesse e maturidade
5. **Mostre entusiasmo** - Demonstre que gosta do que faz

---

## 🎯 FRASE DE FECHAMENTO

> "Este projeto demonstra minha capacidade de estruturar código de forma organizada, implementar regras de negócio, trabalhar com banco de dados transacional, consumir APIs externas e escrever testes. Estou aberto a feedbacks e ansioso para aprender mais com o time!"

---

**Boa sorte na entrevista! Você consegue! 🚀**
