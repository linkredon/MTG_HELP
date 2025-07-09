// Este arquivo existe apenas para compatibilidade com código existente
// Os modelos reais agora são gerenciados pelo DynamoDB

// Esquema de usuário para referência
const UserSchema = {
  id: String,
  name: String,
  email: String,
  password: String,
  avatar: String,
  role: String,
  joinedAt: String,
  createdAt: String,
  updatedAt: String,
  collectionsCount: Number,
  totalCards: Number,
  achievements: [String]
};

// Exportar um objeto vazio para compatibilidade
export default {};