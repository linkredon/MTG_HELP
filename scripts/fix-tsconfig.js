// fix-tsconfig.js
const fs = require('fs');
const path = require('path');

const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');

try {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  
  // Adicionar configurações recomendadas para Next.js com AWS Amplify
  tsconfig.compilerOptions = {
    ...tsconfig.compilerOptions,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true
  };
  
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  console.log('✅ tsconfig.json atualizado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao atualizar tsconfig.json:', error);
}
