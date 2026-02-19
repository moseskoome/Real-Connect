import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    text: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    images: [{
      type: String,
    }],
    videos: [{
      type: String,
    }],
  },
  shares: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sharedAt: { type: Date, default: Date.now },
  }],
  shareCount: {
    type: Number,
    default: 0,
  },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  }],
  commentCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Post', postSchema);
