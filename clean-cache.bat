@echo off
echo Limpando cache do Next.js...
rmdir /s /q .next
rmdir /s /q node_modules\.cache
if exist .babelrc del /f /q .babelrc
echo Cache limpo com sucesso!
pause