# Étape 1 : build — compile le TypeScript en JavaScript
FROM node:20-alpine AS build
WORKDIR /app

# Copie les fichiers de dépendances et installe tout
COPY package*.json ./
RUN npm ci

# Copie le code source et compile
COPY . .
RUN npx prisma generate
RUN npm run build

# Étape 2 : production — image légère avec seulement le nécessaire
FROM node:20-alpine AS production
WORKDIR /app

# Copie les fichiers de dépendances et installe SEULEMENT la production
COPY package*.json ./
RUN npm ci --omit=dev

# Copie le code compilé et le schéma Prisma depuis l'étape build
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000
CMD ["node", "dist/app.js"]