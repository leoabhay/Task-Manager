const express = require('express');
const router  = express.Router();
const { param, validationResult } = require('express-validator');
const Board  = require('../models/Board');
const Column = require('../models/Column');
const Card   = require('../models/Card');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Get board data
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid board ID')],
  validate,
  async (req, res) => {
    try {
      const board = await Board.findById(req.params.id).lean();
      if (!board) return res.status(404).json({ message: 'Board not found' });

      const columns = await Column.find({ boardId: board._id }).lean();
      const cards   = await Card.find({ boardId: board._id }).lean();

      const columnsMap = {};
      columns.forEach(col  => { columnsMap[col._id.toString()] = col; });

      const cardsMap = {};
      cards.forEach(card => { cardsMap[card._id.toString()] = card; });

      res.json({ board, columns: columnsMap, cards: cardsMap });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;