import { useState, useCallback, useEffect } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { BoardData, Card, Column } from '../types';
import { fetchBoard, createCard, moveCard, deleteCard, updateCard, createColumn, deleteColumn, updateColumn } from '../api/manager';

const BOARD_ID = process.env.REACT_APP_BOARD_ID || '';

export function useBoard() {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load board
  const loadBoard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBoard(BOARD_ID);
      setBoardData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load board. Is the server running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  // Drag end handler
  // Pattern:
  //  1. Bail early if dropped outside a droppable or position unchanged.
  //  2. Apply optimistic update to local state immediately (zero flicker).
  //  3. Call the backend.
  //  4. On backend failure, roll back to the pre-drag snapshot and notify user.
  //
  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, source, destination } = result;

      // Dropped outside any column — no-op
      if (!destination) return;

      // Dropped in the same spot — no-op
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) return;

      if (!boardData) return;

      const sourceCol: Column = boardData.columns[source.droppableId];
      const destCol: Column = boardData.columns[destination.droppableId];
      const isSameColumn = sourceCol._id === destCol._id;

      // Optimistic state update
      // Snapshot for rollback
      const prevBoardData = boardData;

      const newSourceCardOrder = Array.from(sourceCol.cardOrder);
      newSourceCardOrder.splice(source.index, 1);

      let newBoardData: BoardData;

      if (isSameColumn) {
        newSourceCardOrder.splice(destination.index, 0, draggableId);
        newBoardData = {
          ...boardData,
          columns: {
            ...boardData.columns,
            [sourceCol._id]: { ...sourceCol, cardOrder: newSourceCardOrder },
          },
        };
      } else {
        const newDestCardOrder = Array.from(destCol.cardOrder);
        newDestCardOrder.splice(destination.index, 0, draggableId);
        newBoardData = {
          ...boardData,
          columns: {
            ...boardData.columns,
            [sourceCol._id]: { ...sourceCol, cardOrder: newSourceCardOrder },
            [destCol._id]: { ...destCol, cardOrder: newDestCardOrder },
          },
          cards: {
            ...boardData.cards,
            [draggableId]: {
              ...boardData.cards[draggableId],
              columnId: destCol._id,
              position: destination.index,
            },
          },
        };
      }

      // Apply optimistically
      setBoardData(newBoardData);

      // Persist to backend
      try {
        await moveCard(draggableId, {
          sourceColumnId: source.droppableId,
          destColumnId: destination.droppableId,
          sourceIndex: source.index,
          destIndex: destination.index,
        });
      } catch (err) {
        console.error('Move failed, rolling back:', err);
        // Rollback on failure
        setBoardData(prevBoardData);
        alert('Failed to save card position. Changes have been reverted.');
      }
    },
    [boardData]
  );

  // Add card
  const addCard = useCallback(
    async (columnId: string, title: string) => {
      if (!boardData) return;
      try {
        const card = await createCard({
          title,
          columnId,
          boardId: boardData.board._id,
          priority: 'medium',
        });

        setBoardData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            cards: { ...prev.cards, [card._id]: card },
            columns: {
              ...prev.columns,
              [columnId]: {
                ...prev.columns[columnId],
                cardOrder: [...prev.columns[columnId].cardOrder, card._id],
              },
            },
          };
        });
      } catch (err) {
        console.error('Failed to create card:', err);
        alert('Failed to create card.');
      }
    },
    [boardData]
  );

  // Delete card
  const removeCard = useCallback(
    async (cardId: string) => {
      if (!boardData) return;
      const card = boardData.cards[cardId];
      if (!card) return;

      // Optimistic removal
      const prevBoardData = boardData;
      const newCards = { ...boardData.cards };
      delete newCards[cardId];

      setBoardData({
        ...boardData,
        cards: newCards,
        columns: {
          ...boardData.columns,
          [card.columnId]: {
            ...boardData.columns[card.columnId],
            cardOrder: boardData.columns[card.columnId].cardOrder.filter((id) => id !== cardId),
          },
        },
      });

      try {
        await deleteCard(cardId);
      } catch (err) {
        console.error('Delete failed, rolling back:', err);
        setBoardData(prevBoardData);
        alert('Failed to delete card. Changes reverted.');
      }
    },
    [boardData]
  );

  // Update card
  const editCard = useCallback(
    async (cardId: string, updates: Partial<Card>) => {
      if (!boardData) return;
      const prevBoardData = boardData;

      // Optimistic
      setBoardData({
        ...boardData,
        cards: {
          ...boardData.cards,
          [cardId]: { ...boardData.cards[cardId], ...updates },
        },
      });

      try {
        await updateCard(cardId, updates);
      } catch (err) {
        console.error('Update failed, rolling back:', err);
        setBoardData(prevBoardData);
        alert('Failed to update card. Changes reverted.');
      }
    },
    [boardData]
  );

  // Add column
  const addColumn = useCallback(
    async (title: string) => {
      if (!boardData) return;
      try {
        const column = await createColumn({
          title,
          boardId: boardData.board._id,
          color: '#f1f5f9',
        });

        setBoardData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: { ...prev.columns, [column._id]: column },
            board: {
              ...prev.board,
              columnOrder: [...prev.board.columnOrder, column._id],
            },
          };
        });
      } catch (err) {
        console.error('Failed to create column:', err);
        alert('Failed to create column.');
      }
    },
    [boardData]
  );

  // Remove column
  const removeColumn = useCallback(
    async (columnId: string) => {
      if (!boardData) return;
      const prevBoardData = boardData;

      // Optimistic
      const newColumns = { ...boardData.columns };
      delete newColumns[columnId];

      setBoardData({
        ...boardData,
        columns: newColumns,
        board: {
          ...boardData.board,
          columnOrder: boardData.board.columnOrder.filter((id) => id !== columnId),
        },
      });

      try {
        await deleteColumn(columnId);
      } catch (err) {
        console.error('Delete column failed, rolling back:', err);
        setBoardData(prevBoardData);
        alert('Failed to delete column.');
      }
    },
    [boardData]
  );

  // Edit column
  const editColumn = useCallback(
    async (columnId: string, updates: Partial<Column>) => {
      if (!boardData) return;
      const prevBoardData = boardData;

      setBoardData({
        ...boardData,
        columns: {
          ...boardData.columns,
          [columnId]: { ...boardData.columns[columnId], ...updates },
        },
      });

      try {
        await updateColumn(columnId, updates);
      } catch (err) {
        console.error('Update column failed, rolling back:', err);
        setBoardData(prevBoardData);
        alert('Failed to update column.');
      }
    },
    [boardData]
  );

  return { 
    boardData, 
    loading, 
    error, 
    onDragEnd, 
    addCard, 
    removeCard, 
    editCard, 
    addColumn, 
    removeColumn, 
    editColumn,
    reload: loadBoard 
  };
}