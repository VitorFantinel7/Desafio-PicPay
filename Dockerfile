# Dockerfile - Cria a imagem da aplicação
# Multi-stage build para otimização

# Stage 1: Instalação das dependências
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências
RUN npm ci

# Gera o Prisma Client
RUN npx prisma generate

# Stage 2: Imagem final
FROM node:20-alpine

WORKDIR /app

# Copia dependências instaladas
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Copia código fonte
COPY . .

# Expõe a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
