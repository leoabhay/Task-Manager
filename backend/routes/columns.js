const express = require('express');
const router  = express.Router();
const { body, param, validationResult } = require('express-validator');
const Column = require('../models/Column');
const Board  = require('../models/Board');
const Card   = require('../models/Card');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Create a new column in a board
router.post(
  '/',
  [
    body('title').notEmpty().trim().isLength({ max: 100 }),
    body('boardId').isMongoId(),
    body('color').optional().isHexColor(),
  ],
  validate,
  async (req, res) => {
    try {
      const { title, boardId, color } = req.body;
      const board = await Board.findById(boardId);
      if (!board) return res.status(404).json({ message: 'Board not found' });

      const column = await Column.create({
        title,
        boardId,
        color: color || '#f1f5f9',
        cardOrder: [],
      });

      board.columnOrder.push(column._id);
      await board.save();

      res.status(201).json(column);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update column title
router.patch(
  '/:id',
  [
    param('id').isMongoId(),
    body('title').optional().trim().isLength({ min: 1, max: 100 }),
    body('color').optional().isHexColor(),
  ],
  validate,
  async (req, res) => {
    try {
      const { title, color } = req.body;
      const column = await Column.findByIdAndUpdate(
        req.params.id,
        { title, color },
        { new: true, runValidators: true }
      );
      if (!column) return res.status(404).json({ message: 'Column not found' });
      res.json(column);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Remove a column and all its cards
router.delete(
  '/:id',
  [param('id').isMongoId()],
  validate,
  async (req, res) => {
    try {
      const column = await Column.findById(req.params.id);
      if (!column) return res.status(404).json({ message: 'Column not found' });

      // Remove cards in column
      await Card.deleteMany({ columnId: column._id });

      // Remove column from board order
      await Board.updateMany(
        { columnOrder: column._id },
        { $pull: { columnOrder: column._id } }
      );

      // Delete column
      await Column.findByIdAndDelete(req.params.id);

      res.json({ message: 'Column deleted', id: req.params.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;