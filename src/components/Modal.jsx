import React from 'react';

export default function Modal({ show, title, children, onCancel, onOk, okLabel = 'Save' }) {
  if (!show) return null;
  return (
    <div className="modal-overlay show">
      <div className="mbox">
        <div className="mhd">
          <h3>{title}</h3>
          <button onClick={onCancel}>×</button>
        </div>
        <div className="mb">
          {children}
        </div>
        <div className="mft">
          <button className="btn sec" onClick={onCancel}>Cancel</button>
          {onOk && <button className="btn" onClick={onOk}>{okLabel}</button>}
        </div>
      </div>
    </div>
  );
}
