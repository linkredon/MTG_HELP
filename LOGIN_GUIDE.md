# 👤 Guia do Sistema de Login - MTG Helper

## 📋 Visão Geral

O MTG Helper possui um sistema completo de login e gerenciamento de usuário integrado ao header da aplicação. Este sistema permite que você mantenha suas coleções, decks e preferências sincronizadas.

## 🚀 Como Usar o Sistema de Login

### 1. **Acessando o Login**
- No canto superior direito da tela, você verá o botão azul **"Entrar"**
- Clique no botão para abrir o modal de autenticação

### 2. **Fazendo Login**
- **Para usuários existentes:**
  - Insira seu email e senha
  - Clique em "Entrar"
  
- **Para novos usuários:**
  - Clique na aba "Cadastrar"
  - Preencha: Nome, Email, Senha e Confirme a Senha
  - Clique em "Criar Conta"

### 3. **Opções Sociais** (Simuladas)
- Login com Google
- Login com GitHub
- *Nota: Atualmente são mockups para demonstração*

## 👤 Perfil de Usuário

### **Menu do Usuário**
Após fazer login, você verá seu avatar no canto superior direito. Clique nele para acessar:

- **Estatísticas Rápidas:**
  - Número de coleções
  - Total de cartas

- **Menu Dropdown:**
  - 📊 Estatísticas detalhadas
  - 🏆 Conquistas recentes
  - 👤 Perfil (em desenvolvimento)
  - ⚙️ Configurações (em desenvolvimento)
  - 🚪 Sair

### **Conquistas**
O sistema de conquistas rastreia automaticamente:
- "Primeira Carta Adicionada!"
- "Colecionador Iniciante" (10+ cartas)
- "Deck Builder" (primeiro deck criado)
- E muitas outras...

## 💾 Persistência de Dados

### **LocalStorage**
- Seu login é salvo automaticamente no navegador
- Ao retornar à aplicação, você permanecerá logado
- Para sair completamente, use a opção "Sair" do menu

### **Dados Salvos**
Atualmente, o sistema salva localmente:
- Informações do usuário
- Coleções de cartas
- Configurações pessoais

## 🔧 Funcionalidades Técnicas

### **Estado do Usuário**
```typescript
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  joinedAt: string
  collectionsCount: number
  totalCards: number
  achievements: string[]
}
```

### **Autenticação**
- Sistema mock para demonstração
- Validação básica de formulários
- Gerenciamento de estado com React hooks
- Persistência com localStorage

## 🔮 Funcionalidades Futuras

### **Planejado para Próximas Versões:**
- Autenticação real com backend
- Sincronização em nuvem
- Perfis públicos
- Sistema de amigos
- Histórico de trades
- Wishlist compartilhada

## 🐛 Solução de Problemas

### **Problemas Comuns:**

1. **Login não funciona:**
   - Verifique se preencheu todos os campos
   - Certifique-se que a senha tem pelo menos 6 caracteres

2. **Perdeu o login:**
   - Verifique se o localStorage não foi limpo
   - Faça login novamente

3. **Avatar não aparece:**
   - O sistema usa a primeira letra do nome como fallback
   - Avatars personalizados serão adicionados em versões futuras

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte a documentação principal (README.md)
- Verifique os logs do console do navegador
- Reporte bugs através dos canais apropriados

---

**Versão do Sistema:** 1.0.0  
**Última Atualização:** Janeiro 2025  
**Compatibilidade:** Todos os navegadores modernos
