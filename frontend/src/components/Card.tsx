import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import type { Card as CardType, Priority } from "../types";

const PRIORITY_STYLES: Record<Priority, { dot: string; label: string }> = {
  low: { dot: "#94a3b8", label: "Low" },
  medium: { dot: "#f59e0b", label: "Medium" },
  high: { dot: "#ef4444", label: "High" },
  urgent: { dot: "#7c3aed", label: "Urgent" },
};

interface Props {
  card: CardType;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<CardType>) => void;
}

export const Card: React.FC<Props> = ({ card, index, onDelete, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const pStyle = PRIORITY_STYLES[card.priority];

  const saveEdit = () => {
    if (editTitle.trim() && editTitle !== card.title) {
      onEdit(card._id, { title: editTitle.trim() });
    }
    setEditing(false);
  };

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`kanban-card ${snapshot.isDragging ? "dragging" : ""}`}
          style={{ ...provided.draggableProps.style }}
        >
          {/* Priority indicator */}
          <div className="card-priority">
            <span className="priority-dot" style={{ background: pStyle.dot }} />
            <span className="priority-label">{pStyle.label}</span>
          </div>

          {/* Title */}
          {editing ? (
            <textarea
              className="card-edit-input"
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                }
                if (e.key === "Escape") {
                  setEditing(false);
                  setEditTitle(card.title);
                }
              }}
              rows={2}
            />
          ) : (
            <p className="card-title" onClick={() => setEditing(true)}>
              {card.title}
            </p>
          )}

          {/* Description snippet */}
          {card.description && !editing && (
            <p className="card-description">{card.description}</p>
          )}

          {/* Tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="card-tags">
              {card.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="card-footer">
            <button
              className="btn-icon-sm edit"
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              title="Edit title"
            >
              ✏️
            </button>
            <button
              className="btn-icon-sm delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card._id);
              }}
              title="Delete task"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};
