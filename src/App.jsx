import React, { useState, useEffect } from "react";
import Header from "./Header";
import Note from "./Note";
import CreateArea from "./CreateArea";

function App() {
  const [notes, setNotes] = useState([]);
  const [draggedNoteId, setDraggedNoteId] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null);

  
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        
        if (Array.isArray(parsed) && parsed.every(n => n.id && n.title !== undefined)) {
          setNotes(parsed);
        } else {
          localStorage.removeItem("notes"); 
        }
      } catch (e) {
        console.error("Failed to parse notes", e);
        localStorage.removeItem("notes");
      }
    }
  }, []);

  
  useEffect(() => {
    if (notes.length) { 
      const toSave = notes.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        color: n.color || "rgba(255, 255, 255, 1)" 
      }));
      localStorage.setItem("notes", JSON.stringify(toSave));
    }
  }, [notes]);

  function addNote(newNote) {
    setNotes((prevNotes) => {
      return [...prevNotes, { 
        ...newNote, 
        id: Date.now(), 
        color: newNote.color || "#ffffff" 
      }];
    });
  }

  function deleteNote(id) {
    setNotes((prevNotes) => {
      return prevNotes.filter((noteItem) => noteItem.id !== id);
    });
  }

  function editNote(id, updatedNote) {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, ...updatedNote } : note
      )
    );
  }

  function handleDragStart(id) {
    setDraggedNoteId(id);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    if (draggedNoteId === null) return;
    
    const hoveredNote = notes[index];
    if (hoveredNote.id === draggedNoteId) {
      setDropIndicator(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const hoverMiddleY = (rect.bottom - rect.top) / 2;
    const hoverClientY = e.clientY - rect.top;
    
    
    if (hoverClientY < hoverMiddleY) {
      setDropIndicator({ index, position: 'above' });
    } else {
      setDropIndicator({ index, position: 'below' });
    }
  }

  function handleDragEnd() {
    setDraggedNoteId(null);
    setDropIndicator(null);
  }

  function handleDrop(index) {
    if (draggedNoteId === null) return;

    const draggedIndex = notes.findIndex(note => note.id === draggedNoteId);
    if (draggedIndex === -1) return;

    let newIndex = index;
    if (dropIndicator) {
      
      newIndex = dropIndicator.position === 'below' ? index + 1 : index;
      newIndex = Math.min(Math.max(newIndex, 0), notes.length);
    }

    if (draggedIndex !== newIndex) {
      const newNotes = [...notes];
      const [movedNote] = newNotes.splice(draggedIndex, 1);
      newNotes.splice(newIndex, 0, movedNote);
      setNotes(newNotes);
    }

    setDraggedNoteId(null);
    setDropIndicator(null);
  }

  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      <div className="notes-container">
        {notes.map((noteItem, index) => {
          const isDragged = noteItem.id === draggedNoteId;
          const showIndicatorAbove = dropIndicator?.index === index && dropIndicator.position === 'above';
          const showIndicatorBelow = dropIndicator?.index === index && dropIndicator.position === 'below';

          return (
            <React.Fragment key={noteItem.id}>
              {showIndicatorAbove && (
                <div className="drop-indicator" style={{ height: '4px', background: '#f5ba13', margin: '2px 0' }} />
              )}

              <Note
                id={noteItem.id}
                title={noteItem.title}
                content={noteItem.content}
                color={noteItem.color}
                onDelete={deleteNote}
                onEdit={editNote}
                onDragStart={() => handleDragStart(noteItem.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={() => handleDrop(index)}
                style={{
                  opacity: isDragged ? 0.5 : 1,
                  transform: isDragged ? 'scale(0.95)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
              />

              {showIndicatorBelow && (
                <div className="drop-indicator" style={{ height: '4px', background: '#f5ba13', margin: '2px 0' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default App;