import React from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Column } from "./Column";
import { useBoard } from "../hooks/useBoard";
import type { Card as CardType } from "../types";

export const Board: React.FC = () => {
  const {
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
  } = useBoard();

  const [isAddingColumn, setIsAddingColumn] = React.useState(false);
  const [newColumnTitle, setNewColumnTitle] = React.useState("");

  const submitAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim());
    }
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;
  if (!boardData) return null;

  const { board, columns, cards } = boardData;

  return (
    <div className="kanban-container">
      {/* Header */}
      <header className="kanban-header">
        <div className="navbar-left">
          <div className="kanban-logo">
            <svg
              width="32"
              height="32"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="100"
                height="100"
                rx="20"
                fill="white"
                fillOpacity="0.2"
              />
              <path
                d="M30 52L44 66L70 36"
                stroke="white"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="board-info">
            <h1>Task Manager</h1>
            <div className="kanban-stats">
              {Object.keys(cards).length} tasks &bull;{" "}
              {board.columnOrder.length} lists
            </div>
          </div>
        </div>

        <div className="navbar-center">
          <div className="search-wrapper">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              className="nav-search-input"
            />
          </div>
        </div>

        <div className="navbar-right">
          <button className="nav-icon-btn" title="Notifications">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <button className="nav-icon-btn" title="Settings">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <div className="nav-divider"></div>
          <button className="btn-primary nav-action-btn">New Task</button>
        </div>
      </header>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board-wrapper">
          {board.columnOrder.map((colId) => {
            const column = columns[colId];
            if (!column) return null;

            // Build ordered card list for this column
            const columnCards = column.cardOrder
              .map((id) => cards[id])
              .filter(Boolean) as CardType[];

            return (
              <Column
                key={colId}
                column={column}
                cards={columnCards}
                onAddCard={addCard}
                onDeleteCard={removeCard}
                onEditCard={editCard}
                onDeleteColumn={() => removeColumn(column._id)}
                onEditColumn={(updates) => editColumn(column._id, updates)}
              />
            );
          })}

          {/* Add Column Placeholder */}
          <div className="add-column-wrapper">
            {isAddingColumn ? (
              <div className="add-column-form">
                <input
                  autoFocus
                  type="text"
                  placeholder="Column title..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitAddColumn();
                    if (e.key === "Escape") setIsAddingColumn(false);
                  }}
                />
                <div className="form-actions">
                  <button className="btn-primary" onClick={submitAddColumn}>
                    Add
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => setIsAddingColumn(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="kanban-column add-column-placeholder"
                onClick={() => setIsAddingColumn(true)}
              >
                <span className="add-icon">+</span>
                <span className="add-text">Add Section</span>
              </div>
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="screen-center">
    <div className="loading-spinner" />
    <p style={{ color: "var(--text-muted)" }}>Loading your board...</p>
  </div>
);

const ErrorScreen = ({ message }: { message: string }) => (
  <div className="screen-center">
    <div className="error-card">
      <div style={{ fontSize: "3rem" }}>⚠️</div>
      <h2>Something went wrong</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        {message}
      </p>
      <div style={{ fontSize: "0.8125rem", color: "var(--text-light)" }}>
        If this persists, check your server connection and ENV settings.
      </div>
    </div>
  </div>
);
