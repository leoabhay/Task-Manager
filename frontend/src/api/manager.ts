import axios from 'axios';
import type { BoardData, Card, Column, MoveCardPayload } from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Boards
export const fetchBoard = async (boardId: string): Promise<BoardData> => {
  const { data } = await api.get<BoardData>(`/boards/${boardId}`);
  return data;
};

// Cards
export const createCard = async (payload: {
  title: string;
  columnId: string;
  boardId: string;
  description?: string;
  priority?: string;
}): Promise<Card> => {
  const { data } = await api.post<Card>('/cards', payload);
  return data;
};

export const moveCard = async (
  cardId: string,
  payload: MoveCardPayload
): Promise<Card> => {
  const { data } = await api.put<Card>(`/cards/${cardId}/move`, payload);
  return data;
};

export const updateCard = async (
  cardId: string,
  payload: Partial<Pick<Card, 'title' | 'description' | 'priority' | 'tags' | 'dueDate' | 'assignee'>>
): Promise<Card> => {
  const { data } = await api.patch<Card>(`/cards/${cardId}`, payload);
  return data;
};

export const deleteCard = async (cardId: string): Promise<void> => {
  await api.delete(`/cards/${cardId}`);
};

// Columns
export const createColumn = async (payload: {
  title: string;
  boardId: string;
  color?: string;
}): Promise<Column> => {
  const { data } = await api.post<Column>('/columns', payload);
  return data;
};

export const updateColumn = async (
  columnId: string,
  payload: Partial<Pick<Column, 'title' | 'color'>>
): Promise<Column> => {
  const { data } = await api.patch<Column>(`/columns/${columnId}`, payload);
  return data;
};

export const deleteColumn = async (columnId: string): Promise<void> => {
  await api.delete(`/columns/${columnId}`);
};