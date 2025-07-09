import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
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
    },
    prices: {
      usd: String,
      usd_foil: String,
      eur: String,
      eur_foil: String
    },
    released_at: String
  },
  quantity: {
    type: Number,
    default: 1
  },
  condition: {
    type: String,
    enum: ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'],
    default: 'Near Mint'
  },
  foil: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'English'
  },
  notes: String,
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor, forneça um nome para a coleção'],
    trim: true,
    maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
  },
  description: {
    type: String,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  cards: [CardSchema],
  backgroundImage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para atualizar contadores do usuário
CollectionSchema.post('save', async function() {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    
    if (user) {
      // Contar coleções do usuário
      const collectionsCount = await this.constructor.countDocuments({ user: this.user });
      
      // Contar total de cartas em todas as coleções
      const collections = await this.constructor.find({ user: this.user });
      const totalCards = collections.reduce((sum, collection) => {
        return sum + collection.cards.reduce((cardSum, card) => cardSum + card.quantity, 0);
      }, 0);
      
      // Atualizar usuário
      user.collectionsCount = collectionsCount;
      user.totalCards = totalCards;
      await user.save();
    }
  } catch (err) {
    console.error('Erro ao atualizar estatísticas do usuário:', err);
  }
});

export default mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);