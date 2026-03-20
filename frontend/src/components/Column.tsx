import React, { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Card } from "./Card";
import type { Card as CardType, Column as ColumnType } from "../types";

interface Props {
  column: ColumnType;
  cards: CardType[];
  onAddCard: (columnId: string, title: string) => void;
  onDeleteCard: (id: string) => void;
  onEditCard: (id: string, updates: Partial<CardType>) => void;
  onDeleteColumn: () => void;
  onEditColumn: (updates: Partial<ColumnType>) => void;
}

export const Column: React.FC<Props> = ({
  column,
  cards,
  onAddCard,
  onDeleteCard,
  onEditCard,
  onDeleteColumn,
  onEditColumn,
}) => {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const submitAdd = () => {
    if (newTitle.trim()) {
      onAddCard(column._id, newTitle.trim());
    }
    setNewTitle("");
    setAdding(false);
  };

  const submitEditTitle = () => {
    if (editTitle.trim() && editTitle !== column.title) {
      onEditColumn({ title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="kanban-column">
      {/* Column header */}
      <div className="column-header">
        <div className="column-dot" style={{ background: column.color }} />
        {isEditingTitle ? (
          <input
            autoFocus
            className="column-title-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={submitEditTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitEditTitle();
              if (e.key === "Escape") {
                setIsEditingTitle(false);
                setEditTitle(column.title);
              }
            }}
          />
        ) : (
          <span
            className="column-title"
            onClick={() => setIsEditingTitle(true)}
          >
            {column.title}
          </span>
        )}
        <span className="column-count">{cards.length}</span>
        <button
          className="btn-icon-sm delete-column"
          onClick={() => {
            if (window.confirm("Delete this column and all its tasks?"))
              onDeleteColumn();
          }}
          title="Delete column"
        >
          🗑️
        </button>
      </div>

      {/* Cards droppable area */}
      <Droppable droppableId={column._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`column-content ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
          >
            {cards.map((card, i) => (
              <Card
                key={card._id}
                card={card}
                index={i}
                onDelete={onDeleteCard}
                onEdit={onEditCard}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add card */}
      <div className="add-card-container">
        {adding ? (
          <div className="add-card-form">
            <textarea
              autoFocus
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitAdd();
                }
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewTitle("");
                }
              }}
              rows={2}
            />
            <div className="form-actions">
              <button className="btn-primary" onClick={submitAdd}>
                Add Card
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  setAdding(false);
                  setNewTitle("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="btn-add-initial" onClick={() => setAdding(true)}>
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
};
