const express   = require('express');
const router    = express.Router();
const { body, param, validationResult } = require('express-validator');
const mongoose  = require('mongoose');
const Card      = require('../models/Card');
const Column    = require('../models/Column');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Create a new card
router.post('/',
  [
    body('title').notEmpty().trim().isLength({ max: 200 }),
    body('columnId').isMongoId(),
    body('boardId').isMongoId(),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  ],
  validate,
  async (req, res) => {
    try {
      const { title, columnId, boardId, description, priority, tags, dueDate, assignee } = req.body;
      const column = await Column.findById(columnId);
      if (!column) return res.status(404).json({ message: 'Column not found' });

      const position = column.cardOrder.length;
      const card = await Card.create({ title, columnId, boardId, description, priority, tags, dueDate, assignee, position });
      
      column.cardOrder.push(card._id);
      await column.save();
      res.status(201).json(card);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update a card
router.put('/:id/move',
  [
    param('id').isMongoId(),
    body('sourceColumnId').isMongoId(),
    body('destColumnId').isMongoId(),
    body('sourceIndex').isInt({ min: 0 }),
    body('destIndex').isInt({ min: 0 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { sourceColumnId, destColumnId, sourceIndex, destIndex } = req.body;
      const isSameColumn = sourceColumnId === destColumnId;

      let sourceCol, destCol;
      if (isSameColumn) {
        sourceCol = destCol = await Column.findById(sourceColumnId);
      } else {
        [sourceCol, destCol] = await Promise.all([
          Column.findById(sourceColumnId),
          Column.findById(destColumnId),
        ]);
      }
      if (!sourceCol || !destCol) return res.status(404).json({ message: 'Column not found' });

      sourceCol.cardOrder.splice(sourceIndex, 1);
      if (isSameColumn) {
        sourceCol.cardOrder.splice(destIndex, 0, id);
        await sourceCol.save();
      } else {
        destCol.cardOrder.splice(destIndex, 0, id);
        await Promise.all([sourceCol.save(), destCol.save()]);
      }

      const updatedCard = await Card.findByIdAndUpdate(
        id, { columnId: destColumnId, position: destIndex }, { new: true }
      );
      if (!updatedCard) return res.status(404).json({ message: 'Card not found' });

      res.json(updatedCard);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Patch a card
router.patch('/:id',
  [
    param('id').isMongoId(),
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  ],
  validate,
  async (req, res) => {
    try {
      const allowed = ['title', 'description', 'priority', 'tags', 'dueDate', 'assignee'];
      const update = {};
      allowed.forEach(key => { if (req.body[key] !== undefined) update[key] = req.body[key]; });

      const card = await Card.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
      if (!card) return res.status(404).json({ message: 'Card not found' });
      res.json(card);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete a card
router.delete('/:id',
  [param('id').isMongoId()],
  validate,
  async (req, res) => {
    try {
      const card = await Card.findByIdAndDelete(req.params.id);
      if (!card) return res.status(404).json({ message: 'Card not found' });

      await Column.findByIdAndUpdate(card.columnId, { $pull: { cardOrder: card._id } });
      res.json({ message: 'Card deleted', id: req.params.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;