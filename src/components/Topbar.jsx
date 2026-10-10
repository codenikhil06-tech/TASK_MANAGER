import React from 'react';
import { useTaskContext } from '../context/TaskContext';

export default function Topbar({ title, toggleSide }) {
  const { toggleTheme } = useTaskContext();
  const dtxt = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="topbar">
      <button className="hamb" onClick={toggleSide}>☰</button>
      <h1 id="ptitle">{title}</h1>
      <div className="sp"></div>
      <div className="dt" id="dtxt">{dtxt}</div>
      <button className="btn sec sm" onClick={toggleTheme} title="Theme">🌓</button>
    </div>
  );
}
