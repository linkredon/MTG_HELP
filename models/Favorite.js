// Este arquivo existe apenas para compatibilidade com código existente
// Os modelos reais agora são gerenciados pelo DynamoDB

// Esquema de favorito para referência
const FavoriteSchema = {
  id: String,
  userId: String,
  card: Object,
  addedAt: String
};

// Exportar um objeto vazio para compatibilidade
export default {};