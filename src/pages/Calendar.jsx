import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { todayStr, prettyDate, pad } from '../utils/db';
import Modal from '../components/Modal';

export default function Calendar() {
  const { DB, me } = useTaskContext();
  const [calM, setCalM] = useState(new Date());
  const [modalDate, setModalDate] = useState(null);

  const isAdmin = me.role === 'admin';
  const scoped = isAdmin ? DB.tasks : DB.tasks.filter(t => t.assignee === me.id);
  const isOverdue = (t) => t.due < todayStr() && t.status !== 'Approved' && t.status !== 'Awaiting Approval';

  const y = calM.getFullYear();
  const m = calM.getMonth();
  const first = new Date(y, m, 1).getDay();
  const dim = new Date(y, m + 1, 0).getDate();
  const td = todayStr();

  const calNav = (n) => {
    setCalM(new Date(y, m + n, 1));
  };

  const getUser = (id) => DB.users.find(u => u.id === id) || { name: '(removed)' };
  const prioBadge = p => <span className={`badge p-${p}`}>{p}</span>;
  const statusBadge = s => {
    const mm = {'Pending':'b-pending','In Progress':'b-prog','Awaiting Approval':'b-wait','Approved':'b-ok','Rework':'b-rework'};
    return <span className={`badge ${mm[s]}`}>{s}</span>;
  };

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const blanks = Array.from({ length: first }).map((_, i) => <div key={`out-${i}`} className="d out"></div>);
  
  const cells = [];
  for (let d = 1; d <= dim; d++) {
    const ds = `${y}-${pad(m+1)}-${pad(d)}`;
    const dow = new Date(y, m, d).getDay();
    const dt = scoped.filter(t => t.due === ds);
    const hol = DB.holidays.filter(h => h.date === ds);
    
    cells.push(
      <div key={d} className={`d ${ds === td ? 'today' : ''} ${dow === 0 ? 'sun' : ''}`} onClick={() => setModalDate(ds)}>
        <span className="n">{d}</span>
        {hol.slice(0, 3).map(h => <div key={h.id} className="chip h">🎉 {h.name}</div>)}
        {dt.slice(0, Math.max(0, 3 - hol.length)).map(t => (
          <div key={t.id} className={`chip ${t.status === 'Approved' ? 'dn' : isOverdue(t) ? 'od' : 't'}`}>{t.title}</div>
        ))}
        {(hol.length + dt.length) > 3 && <div className="muted" style={{ fontSize: 11 }}>+{(hol.length + dt.length) - 3} more</div>}
      </div>
    );
  }

  const dtModal = modalDate ? scoped.filter(t => t.due === modalDate) : [];
  const holModal = modalDate ? DB.holidays.filter(h => h.date === modalDate) : [];

  return (
    <>
      <div className="calhd">
        <button className="btn sec sm" onClick={() => calNav(-1)}>◀</button>
        <h2>{calM.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h2>
        <button className="btn sec sm" onClick={() => calNav(1)}>▶</button>
        <button className="btn ghost sm" onClick={() => setCalM(new Date())}>Aaj</button>
      </div>
      <div className="cal">
        {days.map(d => <div key={d} className="h">{d}</div>)}
        {blanks}
        {cells}
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12.5 }} className="muted">
        <span><span className="chip t">Task</span></span>
        <span><span className="chip od">Overdue</span></span>
        <span><span className="chip dn">Approved</span></span>
        <span><span className="chip h">Holiday</span></span>
      </div>

      <Modal show={!!modalDate} title={modalDate ? prettyDate(modalDate) : ''} onCancel={() => setModalDate(null)}>
        {holModal.map(h => <p key={h.id} style={{ marginBottom: 8 }}>🎉 <b>{h.name}</b> <span className="muted">(Holiday)</span></p>)}
        {dtModal.map(t => (
          <div key={t.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="tt">{t.title}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{getUser(t.assignee).name} • {prioBadge(t.priority)} {statusBadge(t.status)}</div>
          </div>
        ))}
        {(!dtModal.length && !holModal.length) && <div className="empty">Is din koi task ya holiday nahi</div>}
      </Modal>
    </>
  );
}
