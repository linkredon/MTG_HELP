#!/bin/bash

# Script de restauração para bash/shell

# Definir as pastas
BACKUP_FOLDER="backup-auth"
LIB_FOLDER="lib"
APP_FOLDER="app"

echo "Iniciando restauração da configuração de autenticação..."

# Restaurar amplifyClient.ts
if [ -f "$BACKUP_FOLDER/amplifyClient.ts" ]; then
    cp "$BACKUP_FOLDER/amplifyClient.ts" "$LIB_FOLDER/amplifyClient.ts"
    echo "✅ Restaurado amplifyClient.ts"
else
    echo "⚠️ Arquivo amplifyClient.ts não encontrado no backup"
fi

# Restaurar .env.local
if [ -f "$BACKUP_FOLDER/.env.local.backup" ]; then
    cp "$BACKUP_FOLDER/.env.local.backup" ".env.local"
    echo "✅ Restaurado .env.local"
else
    echo "⚠️ Arquivo .env.local.backup não encontrado no backup"
fi

# Restaurar auth.ts
if [ -f "$BACKUP_FOLDER/auth.ts" ]; then
    cp "$BACKUP_FOLDER/auth.ts" "auth.ts"
    echo "✅ Restaurado auth.ts"
else
    echo "⚠️ Arquivo auth.ts não encontrado no backup"
fi

# Restaurar auth-config.ts
if [ -f "$BACKUP_FOLDER/auth-config.ts" ]; then
    cp "$BACKUP_FOLDER/auth-config.ts" "$LIB_FOLDER/auth-config.ts"
    echo "✅ Restaurado auth-config.ts"
else
    echo "⚠️ Arquivo auth-config.ts não encontrado no backup"
fi

# Restaurar nextauth-route.ts
if [ -f "$BACKUP_FOLDER/nextauth-route.ts" ]; then
    # Garantir que o diretório de destino existe
    mkdir -p "$APP_FOLDER/api/auth/[...nextauth]"
    cp "$BACKUP_FOLDER/nextauth-route.ts" "$APP_FOLDER/api/auth/[...nextauth]/route.ts"
    echo "✅ Restaurado nextauth-route.ts"
else
    echo "⚠️ Arquivo nextauth-route.ts não encontrado no backup"
fi

echo ""
echo "Restauração concluída. Execute 'npm install next-auth@latest' se necessário e reinicie o servidor."
