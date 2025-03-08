import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  match: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  prediction: {
    homeScore: {
      type: Number,
      required: true,
    },
    awayScore: {
      type: Number,
      required: true,
    },
  },
  points: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'calculated'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Prediction || mongoose.model('Prediction', predictionSchema); 