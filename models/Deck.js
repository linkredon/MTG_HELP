// Este arquivo existe apenas para compatibilidade com código existente
// Os modelos reais agora são gerenciados pelo DynamoDB

// Esquema de deck para referência
const DeckSchema = {
  id: String,
  userId: String,
  name: String,
  description: String,
  format: String,
  colors: [String],
  cards: [{
    card: Object,
    quantity: Number,
    category: String,
    _id: String
  }],
  createdAt: String,
  lastModified: String,
  isPublic: Boolean,
  tags: [String]
};

// Exportar um objeto vazio para compatibilidade
export default {};