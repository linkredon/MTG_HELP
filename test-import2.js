// Teste de importação do QuadroFiltrosTest
try {
  const { QuadroFiltrosTest } = require('./components/QuadroFiltrosTest.tsx');
  console.log('QuadroFiltrosTest named export:', typeof QuadroFiltrosTest);
  
  const QuadroFiltrosTestDefault = require('./components/QuadroFiltrosTest.tsx').default;
  console.log('QuadroFiltrosTest default export:', typeof QuadroFiltrosTestDefault);
} catch (error) {
  console.log('Erro ao importar QuadroFiltrosTest:', error.message);
}
