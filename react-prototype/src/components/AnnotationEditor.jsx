import React, { useState, useEffect } from 'react';
import { X, Trash2, Check } from 'lucide-react';

const AnnotationEditor = ({ annotation, onUpdate, onDelete, onClose }) => {
  const [text, setText] = useState('');
  const [size, setSize] = useState('medium');

  useEffect(() => {
    if (annotation) {
      setText(annotation.text || '');
      setSize(annotation.size || 'medium');
    }
  }, [annotation]);

  const handleSave = () => {
    onUpdate({
      ...annotation,
      text,
      size
    });
    onClose();
  };

  return (
    <div className="annotation-editor-overlay">
      <div className="annotation-editor">
        <div className="editor-header">
          <h3>Edit Note</h3>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>

        <div className="editor-body">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter note text..."
            rows={3}
            autoFocus
          />

          <div className="size-selector">
            <label>Size:</label>
            <div className="size-options">
              <button
                className={`size-btn ${size === 'small' ? 'active' : ''}`}
                onClick={() => setSize('small')}
              >S</button>
              <button
                className={`size-btn ${size === 'medium' ? 'active' : ''}`}
                onClick={() => setSize('medium')}
              >M</button>
              <button
                className={`size-btn ${size === 'large' ? 'active' : ''}`}
                onClick={() => setSize('large')}
              >L</button>
            </div>
          </div>
        </div>

        <div className="editor-footer">
          <button onClick={onDelete} className="delete-btn">
            <Trash2 size={16} style={{ marginRight: 4 }} />
            Remove
          </button>
          <button onClick={handleSave} className="save-btn">
            <Check size={16} style={{ marginRight: 4 }} />
            Done
          </button>
        </div>
      </div>
      <style>{`
        .annotation-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }
        .annotation-editor {
          background: white;
          width: 320px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        .editor-header {
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .editor-header h3 { margin: 0; font-size: 1rem; }
        .editor-body { padding: 16px; }
        textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
          font-family: inherit;
          margin-bottom: 12px;
          box-sizing: border-box;
        }
        .size-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .size-options {
          display: flex;
          gap: 4px;
        }
        .size-btn {
          padding: 4px 12px;
          border: 1px solid #ddd;
          background: #f9f9f9;
          cursor: pointer;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        .size-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .editor-footer {
          padding: 12px 16px;
          background: #f9f9f9;
          display: flex;
          justify-content: space-between;
        }
        .delete-btn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .save-btn {
          background: #22c55e;
          color: white;
          border: none;
          padding: 6px 16px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default AnnotationEditor;
