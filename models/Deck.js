import mongoose from 'mongoose';

const DeckCardSchema = new mongoose.Schema({
  card: {
    id: String,
    name: String,
    set_code: String,
    set_name: String,
    collector_number: String,
    rarity: String,
    type_line: String,
    oracle_text: String,
    mana_cost: String,
    cmc: Number,
    colors: [String],
    color_identity: [String],
    image_uris: {
      small: String,
      normal: String,
      large: String,
      png: String,
      art_crop: String
    }
  },
  quantity: {
    type: Number,
    default: 1
  },
  isSideboard: {
    type: Boolean,
    default: false
  },
  isCommander: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['creature', 'instant', 'sorcery', 'artifact', 'enchantment', 'planeswalker', 'land', 'other'],
    default: 'other'
  }
});

const DeckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, forneça um nome para o deck'],
    trim: true,
    maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
  },
  description: {
    type: String,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  format: {
    type: String,
    enum: ['standard', 'modern', 'commander', 'legacy', 'vintage', 'pioneer', 'pauper', 'brawl', 'historic', 'other'],
    default: 'other'
  },
  colors: {
    type: [String],
    default: []
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  cards: [DeckCardSchema],
  coverImage: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Atualizar data de modificação antes de salvar
DeckSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calcular estatísticas do deck
DeckSchema.methods.getStats = function() {
  const mainboard = this.cards.filter(card => !card.isSideboard);
  const sideboard = this.cards.filter(card => card.isSideboard);
  
  const mainboardCount = mainboard.reduce((sum, card) => sum + card.quantity, 0);
  const sideboardCount = sideboard.reduce((sum, card) => sum + card.quantity, 0);
  
  // Distribuição por tipo
  const typeDistribution = mainboard.reduce((acc, card) => {
    acc[card.category] = (acc[card.category] || 0) + card.quantity;
    return acc;
  }, {});
  
  // Curva de mana
  const manaCurve = mainboard.reduce((acc, card) => {
    if (card.card.cmc !== undefined && card.category !== 'land') {
      const cmc = Math.min(Math.floor(card.card.cmc), 7); // Agrupar 7+ em uma categoria
      acc[cmc] = (acc[cmc] || 0) + card.quantity;
    }
    return acc;
  }, {});
  
  return {
    mainboardCount,
    sideboardCount,
    typeDistribution,
    manaCurve,
    colors: this.colors
  };
};

export default mongoose.models.Deck || mongoose.model('Deck', DeckSchema);