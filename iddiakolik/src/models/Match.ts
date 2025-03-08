import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  matchDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'finished'],
    default: 'upcoming',
  },
  result: {
    homeScore: { type: Number, default: null },
    awayScore: { type: Number, default: null },
  },
  predictions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction',
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Match || mongoose.model('Match', matchSchema); 