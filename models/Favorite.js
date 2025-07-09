import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  card: {
    id: {
      type: String,
      required: true
    },
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
  addedAt: {
    type: Date,
    default: Date.now
  }
});

// Índice composto para evitar duplicatas
FavoriteSchema.index({ user: 1, 'card.id': 1 }, { unique: true });

export default mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);