@echo off
echo Limpando cache do Next.js...
rmdir /s /q .next
rmdir /s /q node_modules\.cache
echo Cache limpo com sucesso!
pause