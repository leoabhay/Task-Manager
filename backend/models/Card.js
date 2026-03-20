const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: { type: String, trim: true, maxlength: 2000 },
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Column',
      required: true,
      index: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    // position is a float so we can do fractional re-ordering in the future;
    // for now it mirrors the array index in Column.cardOrder
    position: { type: Number, required: true, default: 0 },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: [{ type: String, trim: true, maxlength: 30 }],
    dueDate: { type: Date },
    assignee: { type: String, trim: true }, // Placeholder until user model exists
  },
  { timestamps: true }
);

// Compound index speeds up board-scoped queries
CardSchema.index({ boardId: 1, columnId: 1, position: 1 });

module.exports = mongoose.model('Card', CardSchema);