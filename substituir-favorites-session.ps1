$filePath = "c:\Users\Vilarejo\Downloads\colecao-page-main\MTG_HELP\contexts\FavoritesContext.tsx"
$content = Get-Content -Path $filePath -Raw

# Substituir todas as ocorrências de session por isAuthenticated
$content = $content -replace "session\)", "isAuthenticated)"
$content = $content -replace "\[session\]", "[isAuthenticated]"

# Salvar as alterações
$content | Set-Content -Path $filePath -Encoding UTF8

Write-Host "Substituições concluídas em $filePath"
