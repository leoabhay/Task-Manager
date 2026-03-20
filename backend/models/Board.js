const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: { type: String, trim: true, maxlength: 500 },
    // Ordered list of column IDs; order here drives column sequence
    columnOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Column' }],
    ownerId: { type: String, default: 'anonymous' }, // Placeholder for auth
  },
  { timestamps: true }
);

module.exports = mongoose.model('Board', BoardSchema);