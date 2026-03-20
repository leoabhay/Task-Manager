const mongoose = require('mongoose');

const ColumnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Column title is required'],
      trim: true,
      maxlength: [80, 'Column title cannot exceed 80 characters'],
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    // Ordered list of card IDs; order drives card sequence within column
    cardOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
    color: { type: String, default: '#e2e8f0' }, // Optional accent color
  },
  { timestamps: true }
);

module.exports = mongoose.model('Column', ColumnSchema);