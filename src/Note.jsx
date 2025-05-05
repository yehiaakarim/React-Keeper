import React, { useState, useRef, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { ChromePicker } from "react-color";

function Note(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(props.title);
  const [content, setContent] = useState(props.content);
  const [color, setColor] = useState(props.color || "rgba(255, 255, 255, 1)");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const noteRef = useRef(null);

  useEffect(() => {
    if (noteRef.current) {
      noteRef.current.style.background = color;
    }
  }, [color]);

  function handleDelete() {
    props.onDelete(props.id);
  }

  function handleEdit() {
    if (isEditing) {
      props.onEdit(props.id, { title, content, color });
    }
    setIsEditing(!isEditing);
  }

  function handleColorChange(newColor) {
    const updatedColor = newColor.rgb.a < 1 
      ? `rgba(${newColor.rgb.r}, ${newColor.rgb.g}, ${newColor.rgb.b}, ${newColor.rgb.a})`
      : newColor.hex;
    
    setColor(updatedColor);
    props.onEdit(props.id, { title, content, color: updatedColor });
  }

  function handleDragStart() {
    props.onDragStart(props.id);
  }

  function handleDragOver(e) {
    e.preventDefault();
    props.onDragOver(e);
  }

  function handleDrop(e) {
    e.preventDefault();
    props.onDrop();
  }

  return (
    <div
      className="note"
      ref={noteRef}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={props.onDragEnd}
      onDrop={handleDrop}
      style={{
        ...props.style,
        background: color,
        boxShadow: color.includes('rgba') ? '0 2px 5px rgba(0, 0, 0, 0.2)' : '0 2px 5px #ccc',
        cursor: 'grab',
      }}
    >
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="edit-input"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
        />
      ) : (
        <h1 style={{
          textShadow: color.includes('rgba') ? '0 0 2px rgba(0, 0, 0, 0.1)' : 'none'
        }}>
          {title}
        </h1>
      )}
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="edit-textarea"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }}
        />
      ) : (
        <p style={{
          textShadow: color.includes('rgba') ? '0 0 2px rgba(0, 0, 0, 0.1)' : 'none'
        }}>
          {content}
        </p>
      )}
      <div className="note-actions">
        <button onClick={handleEdit}>
          <EditIcon />
        </button>
        <button onClick={() => setShowColorPicker(!showColorPicker)}>
          <ColorLensIcon />
        </button>
        <button onClick={handleDelete}>
          <DeleteIcon />
        </button>
      </div>
      {showColorPicker && (
        <div className="color-picker-popup">
          <ChromePicker
            color={color}
            onChangeComplete={handleColorChange}
            width="100%"
            disableAlpha={false}
          />
          <button
            onClick={() => setShowColorPicker(false)}
            style={{
              marginTop: "12px",
              padding: "8px 12px",
              background: "#f5ba13",
              color: "white",
              border: "none",
              borderRadius: "4px",
              width: "100%",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default Note;