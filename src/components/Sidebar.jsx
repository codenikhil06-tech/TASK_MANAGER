import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { initials } from '../utils/db';

export default function Sidebar({ pages, page, setPage, pend, isOpen }) {
  const { me, logout } = useTaskContext();

  return (
    <aside id="side" className={isOpen ? 'open' : ''}>
      <div className="logo"><span className="i">✔</span> TaskFlow</div>
      <nav id="nav">
        {pages.map(p => (
          <a key={p.id} className={p.id === page ? 'active' : ''} onClick={() => setPage(p.id)}>
            <span className="ic">{p.ic}</span>{p.label}
            {p.id === 'approval' && pend > 0 && <span className="cnt">{pend}</span>}
          </a>
        ))}
      </nav>
      <div className="userbox">
        <div className="avatar" id="uav">{initials(me.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="nm" id="unm">{me.name}</div>
          <div className="rl" id="url">{me.role}</div>
        </div>
        <button className="btn sec sm" onClick={logout} title="Logout">⎋</button>
      </div>
    </aside>
  );
}
