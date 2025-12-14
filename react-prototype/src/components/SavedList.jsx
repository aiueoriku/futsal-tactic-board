import React, { useState, useEffect } from 'react';
import { Trash2, FolderOpen, X } from 'lucide-react';

const SavedList = ({ onLoad, onClose }) => {
  const [saves, setSaves] = useState([]);

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = () => {
    const loaded = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('futsal_tactic_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          loaded.push(item);
        } catch (e) {
          console.error('Failed to parse save', key);
        }
      }
    }
    // Sort by date desc
    loaded.sort((a, b) => new Date(b.date) - new Date(a.date));
    setSaves(loaded);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this tactic?')) {
      localStorage.removeItem(`futsal_tactic_${id}`);
      loadSaves();
    }
  };

  return (
    <div className="saved-list-overlay">
      <div className="saved-list-container">
        <div className="saved-list-header">
          <h2>Saved Tactics</h2>
          <button onClick={onClose} className="icon-btn"><X size={24} /></button>
        </div>
        <div className="saved-list-content">
          {saves.length === 0 ? (
            <p className="no-saves">No saved tactics found.</p>
          ) : (
            <ul className="saves-list">
              {saves.map(save => (
                <li key={save.id} className="save-item">
                  <div className="save-info">
                    <span className="save-name">{save.name}</span>
                    <span className="save-date">{new Date(save.date).toLocaleString()}</span>
                  </div>
                  <div className="save-actions">
                    <button onClick={() => onLoad(save.data)} className="load-btn" title="Load">
                      <FolderOpen size={18} />
                    </button>
                    <button onClick={() => handleDelete(save.id)} className="delete-btn" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <style>{`
        .saved-list-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }
        .saved-list-container {
          background: white;
          width: 400px;
          max-height: 80vh;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .saved-list-header {
          padding: 16px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .saved-list-header h2 {
          margin: 0;
          font-size: 1.2rem;
        }
        .saved-list-content {
          padding: 16px;
          overflow-y: auto;
        }
        .saves-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .save-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
        }
        .save-item:last-child {
          border-bottom: none;
        }
        .save-info {
          display: flex;
          flex-direction: column;
        }
        .save-name {
          font-weight: bold;
          font-size: 1rem;
        }
        .save-date {
          font-size: 0.8rem;
          color: #666;
        }
        .save-actions {
          display: flex;
          gap: 8px;
        }
        .load-btn, .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .load-btn:hover {
          background: #e0f2fe;
          color: #0284c7;
        }
        .delete-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }
        .no-saves {
          text-align: center;
          color: #888;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default SavedList;
