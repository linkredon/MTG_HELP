# Script de restauração para PowerShell

# Definir as pastas
$backupFolder = "backup-auth"
$libFolder = "lib"
$appFolder = "app"

Write-Host "Iniciando restauração da configuração de autenticação..."

# Restaurar amplifyClient.ts
if (Test-Path "$backupFolder\amplifyClient.ts") {
    Copy-Item "$backupFolder\amplifyClient.ts" -Destination "$libFolder\amplifyClient.ts" -Force
    Write-Host "✅ Restaurado amplifyClient.ts"
} else {
    Write-Host "⚠️ Arquivo amplifyClient.ts não encontrado no backup"
}

# Restaurar .env.local
if (Test-Path "$backupFolder\.env.local.backup") {
    Copy-Item "$backupFolder\.env.local.backup" -Destination ".env.local" -Force
    Write-Host "✅ Restaurado .env.local"
} else {
    Write-Host "⚠️ Arquivo .env.local.backup não encontrado no backup"
}

# Restaurar auth.ts
if (Test-Path "$backupFolder\auth.ts") {
    Copy-Item "$backupFolder\auth.ts" -Destination "auth.ts" -Force
    Write-Host "✅ Restaurado auth.ts"
} else {
    Write-Host "⚠️ Arquivo auth.ts não encontrado no backup"
}

# Restaurar auth-config.ts
if (Test-Path "$backupFolder\auth-config.ts") {
    Copy-Item "$backupFolder\auth-config.ts" -Destination "$libFolder\auth-config.ts" -Force
    Write-Host "✅ Restaurado auth-config.ts"
} else {
    Write-Host "⚠️ Arquivo auth-config.ts não encontrado no backup"
}

# Restaurar nextauth-route.ts
if (Test-Path "$backupFolder\nextauth-route.ts") {
    # Garantir que o diretório de destino existe
    if (-not (Test-Path "$appFolder\api\auth\[...nextauth]")) {
        New-Item -Path "$appFolder\api\auth\[...nextauth]" -ItemType Directory -Force | Out-Null
    }
    Copy-Item "$backupFolder\nextauth-route.ts" -Destination "$appFolder\api\auth\[...nextauth]\route.ts" -Force
    Write-Host "✅ Restaurado nextauth-route.ts"
} else {
    Write-Host "⚠️ Arquivo nextauth-route.ts não encontrado no backup"
}

Write-Host ""
Write-Host "Restauração concluída. Execute 'npm install next-auth@latest' se necessário e reinicie o servidor."
