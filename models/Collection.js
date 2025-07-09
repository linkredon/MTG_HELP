// Este arquivo existe apenas para compatibilidade com código existente
// Os modelos reais agora são gerenciados pelo DynamoDB

// Esquema de coleção para referência
const CollectionSchema = {
  id: String,
  userId: String,
  name: String,
  description: String,
  cards: [{
    card: Object,
    quantity: Number,
    condition: String,
    foil: Boolean,
    language: String,
    _id: String
  }],
  createdAt: String,
  updatedAt: String,
  isPublic: Boolean
};

// Exportar um objeto vazio para compatibilidade
export default {};