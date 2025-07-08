// Teste de importação do QuadroFiltros
try {
  const { QuadroFiltros } = require('./components/QuadroFiltros.tsx');
  console.log('QuadroFiltros named export:', typeof QuadroFiltros);
  
  const QuadroFiltrosDefault = require('./components/QuadroFiltros.tsx').default;
  console.log('QuadroFiltros default export:', typeof QuadroFiltrosDefault);
} catch (error) {
  console.log('Erro ao importar QuadroFiltros:', error.message);
}
