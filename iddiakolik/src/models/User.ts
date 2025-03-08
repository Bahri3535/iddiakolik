import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  points: {
    type: Number,
    default: 0,
  },
  predictions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction',
  }],
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', userSchema); 