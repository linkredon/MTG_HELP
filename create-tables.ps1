# Script para criar as tabelas DynamoDB necessárias
# Execute este script no PowerShell

Write-Host🚀 Criando tabelas DynamoDB... -ForegroundColor Green

# Tabela mtg_collections
Write-Host 📋 Criando tabela mtg_collections... -ForegroundColor Yellow
aws dynamodb create-table --table-name mtg_collections --attribute-definitions AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput=[object Object]ReadCapacityUnits=5,WriteCapacityUnits=5} --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-2# Tabela mtg_decks
Write-Host 📋 Criando tabela mtg_decks... -ForegroundColor Yellow
aws dynamodb create-table --table-name mtg_decks --attribute-definitions AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput=[object Object]ReadCapacityUnits=5,WriteCapacityUnits=5} --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-2bela mtg_favorites
Write-Host 📋 Criando tabela mtg_favorites... -ForegroundColor Yellow
aws dynamodb create-table --table-name mtg_favorites --attribute-definitions AttributeName=id,AttributeType=S AttributeName=userId,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --global-secondary-indexes IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput=[object Object]ReadCapacityUnits=5,WriteCapacityUnits=5} --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-2

# Tabela mtg_users
Write-Host 📋 Criando tabela mtg_users... -ForegroundColor Yellow
aws dynamodb create-table --table-name mtg_users --attribute-definitions AttributeName=id,AttributeType=S AttributeName=email,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --global-secondary-indexes IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput=[object Object]ReadCapacityUnits=5,WriteCapacityUnits=5} --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-2rite-Host ✅ Tabelas criadas com sucesso! -ForegroundColor Green
Write-Host "📝 Tabelas criadas: -ForegroundColor Cyan
Write-Host - mtg_collections (coleções de cartas) -ForegroundColor White
Write-Host "- mtg_decks (decks) -ForegroundColor White
Write-Host - mtg_favorites (favoritos) -ForegroundColor White
Write-Host- mtg_users (usuários) -ForegroundColor White
Write-Host
Write-Host "💡 Agora você pode usar a aplicação normalmente! -ForegroundColor Green 