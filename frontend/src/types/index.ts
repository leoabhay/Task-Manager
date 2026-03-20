export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Card {
  _id: string;
  title: string;
  description?: string;
  columnId: string;
  boardId: string;
  position: number;
  priority: Priority;
  tags: string[];
  dueDate?: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string;
  title: string;
  boardId: string;
  cardOrder: string[];   // ordered array of card IDs
  color: string;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  columnOrder: string[]; // ordered array of column IDs
}

// Normalised shape returned by GET /api/boards/:id
export interface BoardData {
  board: Board;
  columns: Record<string, Column>;
  cards: Record<string, Card>;
}

export interface MoveCardPayload {
  sourceColumnId: string;
  destColumnId: string;
  sourceIndex: number;
  destIndex: number;
}
