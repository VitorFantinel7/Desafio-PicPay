# 💸 PicPay Simplificado

API RESTful de transferências bancárias simplificada, desenvolvida como parte de um desafio técnico.

## 📋 Índice

- [Sobre](#sobre)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Como Executar](#como-executar)
- [Endpoints](#endpoints)
- [Exemplos de Uso](#exemplos-de-uso)
- [Testes](#testes)
- [Decisões Técnicas](#decisões-técnicas)
- [Melhorias Futuras](#melhorias-futuras)

## 📖 Sobre

O PicPay Simplificado é uma plataforma de pagamentos onde é possível realizar transferências de dinheiro entre usuários. Existem dois tipos de usuários:

- **Usuários Comuns**: Podem enviar e receber transferências
- **Lojistas**: Apenas recebem transferências

### Regras de Negócio

1. ✅ CPF/CNPJ e e-mail devem ser únicos
2. ✅ Usuários podem enviar dinheiro para lojistas e entre si
3. ✅ Lojistas só recebem, não enviam
4. ✅ Validação de saldo antes da transferência
5. ✅ Consulta a serviço autorizador externo
6. ✅ Transferência transacional (rollback em caso de erro)
7. ✅ Notificação assíncrona ao recebedor

## 🛠 Tecnologias

- **Node.js** (v20+) - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM moderno para Node.js
- **PostgreSQL** - Banco de dados relacional
- **Docker** - Containerização
- **Jest** - Framework de testes
- **Axios** - Cliente HTTP

## 🏗 Arquitetura

O projeto segue uma arquitetura em camadas para melhor organização e manutenibilidade:

```
src/
├── controllers/     # Recebe requisições HTTP e retorna respostas
├── services/        # Lógica de negócio
├── repositories/    # Acesso ao banco de dados
├── routes/          # Definição das rotas
├── middlewares/     # Middlewares (tratamento de erros, etc)
├── errors/          # Classes de erro customizadas
├── database/        # Configuração do Prisma
├── app.js           # Configuração do Express
└── server.js        # Ponto de entrada
```

### Fluxo de uma Transferência

```
┌─────────┐    ┌────────────┐    ┌─────────────┐    ┌────────────┐
│ Request │───▶│ Controller │───▶│   Service   │───▶│ Repository │
└─────────┘    └────────────┘    └─────────────┘    └────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Authorization  │
                              │    Service      │
                              └─────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Notification   │
                              │    Service      │
                              └─────────────────┘
```

## 🚀 Como Executar

### Pré-requisitos

- Docker e Docker Compose instalados
- OU Node.js 20+ e PostgreSQL

### Com Docker (Recomendado)

```bash
# Clone o repositório
git clone <seu-repositorio>
cd picpay-simplificado

# Inicie os containers
docker-compose up -d

# A API estará disponível em http://localhost:3000
```

### Sem Docker

```bash
# Clone o repositório
git clone <seu-repositorio>
cd picpay-simplificado

# Instale as dependências
npm install

# Configure o banco de dados no arquivo .env
# DATABASE_URL="postgresql://usuario:senha@localhost:5432/picpay"

# Execute as migrations
npx prisma migrate dev

# Popule o banco com dados de teste
npm run prisma:seed

# Inicie a aplicação
npm run dev
```

## 📡 Endpoints

### Health Check

```
GET /health
```

### Transferências

```
POST /transfer          # Realiza uma transferência
GET  /transfer          # Lista todas as transferências
GET  /transfer/:id      # Busca uma transferência específica
```

### Usuários (Auxiliar)

```
GET /users              # Lista todos os usuários
GET /users/:id          # Busca um usuário específico
```

## 💡 Exemplos de Uso

### Realizar uma Transferência

```bash
curl -X POST http://localhost:3000/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "value": 100.00,
    "payer": 1,
    "payee": 3
  }'
```

**Resposta de Sucesso (201):**

```json
{
  "message": "Transferência realizada com sucesso!",
  "transfer": {
    "id": 1,
    "value": 100,
    "payer": {
      "id": 1,
      "name": "João Silva",
      "newBalance": 900
    },
    "payee": {
      "id": 3,
      "name": "Maria Santos",
      "newBalance": 600
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Erros Possíveis

**Saldo Insuficiente (400):**

```json
{
  "error": "Saldo insuficiente. Saldo atual: R$ 50.00, Valor da transferência: R$ 100.00"
}
```

**Lojista Tentando Transferir (400):**

```json
{
  "error": "Lojistas não podem realizar transferências, apenas receber"
}
```

**Transferência Não Autorizada (403):**

```json
{
  "error": "Transferência não autorizada pelo serviço autorizador"
}
```

### Listar Usuários de Teste

```bash
curl http://localhost:3000/users
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm test -- --coverage

# Executar em modo watch
npm run test:watch
```

### Cobertura de Testes

Os testes cobrem:

- ✅ Transferência bem sucedida
- ✅ Validação de valor (zero/negativo)
- ✅ Transferência para si mesmo
- ✅ Usuário inexistente
- ✅ Lojista tentando transferir
- ✅ Saldo insuficiente
- ✅ Serviço autorizador negando
- ✅ Falha na notificação (não deve bloquear)

## 🤔 Decisões Técnicas

### Por que Express?

- Framework minimalista e flexível
- Curva de aprendizado baixa
- Grande comunidade e ecossistema

### Por que Prisma?

- Type-safe por padrão
- Migrations automáticas
- Query builder intuitivo
- Excelente documentação

### Por que PostgreSQL?

- Robusto e confiável
- Suporte a transações ACID
- Amplamente utilizado na indústria

### Transações no Banco

Utilizei transações do Prisma (`$transaction`) para garantir atomicidade nas transferências. Se qualquer etapa falhar, todas as alterações são revertidas.

### Notificações Assíncronas

A notificação é enviada de forma assíncrona e não bloqueia a resposta da API. Se falhar, a transferência já foi concluída e apenas um log é registrado.

## 🔮 Melhorias Futuras

1. **Autenticação/Autorização**: Implementar JWT para proteger os endpoints
2. **Rate Limiting**: Limitar requisições por IP/usuário
3. **Cache**: Implementar Redis para cache de consultas
4. **Mensageria**: Usar RabbitMQ/Kafka para notificações
5. **Observabilidade**: Adicionar métricas e tracing
6. **CI/CD**: Pipeline de deploy automatizado
7. **Documentação API**: Swagger/OpenAPI

## 📝 Licença

Este projeto foi desenvolvido para fins de avaliação técnica.
