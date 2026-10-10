import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { prettyDate, todayStr } from '../utils/db';

export default function TaskManager({ showToast }) {
  const { DB, me, save } = useTaskContext();
  const [q, setQ] = useState('');
  const [st, setSt] = useState('all');

  const isAdmin = me.role === 'admin';
  const scoped = isAdmin ? DB.tasks : DB.tasks.filter(t => t.assignee === me.id);
  const isOverdue = (t) => t.due < todayStr() && t.status !== 'Approved' && t.status !== 'Awaiting Approval';

  let ts = scoped.filter(t => (t.title + t.desc + (DB.users.find(u => u.id === t.assignee)?.name || '')).toLowerCase().includes(q.toLowerCase()));
  if (st === 'Overdue') ts = ts.filter(isOverdue);
  else if (st !== 'all') ts = ts.filter(t => t.status === st);
  
  ts.sort((a, b) => a.due.localeCompare(b.due));

  const getUser = (id) => DB.users.find(u => u.id === id) || { name: '(removed)' };

  const prioBadge = p => <span className={`badge p-${p}`}>{p}</span>;
  const statusBadge = s => {
    const m = {'Pending':'b-pending','In Progress':'b-prog','Awaiting Approval':'b-wait','Approved':'b-ok','Rework':'b-rework'};
    return <span className={`badge ${m[s]}`}>{s}</span>;
  };
  const dueCell = t => <span className={isOverdue(t) ? 'overdue' : ''}>{prettyDate(t.due)}{isOverdue(t) ? ' ⚠' : ''}</span>;

  const startTask = (id) => {
    const newDB = { ...DB };
    const t = newDB.tasks.find(x => x.id === id);
    if (t) {
      t.status = 'In Progress';
      save(newDB);
      showToast('Task start ho gaya');
    }
  };

  const doneTask = (id) => {
    if (!window.confirm('Task complete mark karke admin approval ke liye bhejein?')) return;
    const newDB = { ...DB };
    const t = newDB.tasks.find(x => x.id === id);
    if (t) {
      t.status = 'Awaiting Approval';
      t.doneAt = todayStr();
      t.remark = '';
      save(newDB);
      showToast('Admin approval ke liye bhej diya ✔');
    }
  };

  const delTask = (id) => {
    if (!window.confirm('Ye task delete karein?')) return;
    const newDB = { ...DB, tasks: DB.tasks.filter(t => t.id !== id) };
    save(newDB);
    showToast('Task delete ho gaya');
  };

  return (
    <>
      <div className="toolbar">
        <input placeholder="🔍 Task search karein..." value={q} onChange={e => setQ(e.target.value)} />
        <select value={st} onChange={e => setSt(e.target.value)}>
          {['all','Pending','In Progress','Awaiting Approval','Approved','Rework','Overdue'].map(s => (
            <option key={s} value={s}>{s === 'all' ? 'Sabhi Status' : s}</option>
          ))}
        </select>
        <div className="sp"></div>
      </div>
      <div className="card">
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Task</th>
                <th>{isAdmin ? 'Assigned To' : 'Assigned By'}</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ts.length > 0 ? ts.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="tt">{t.title}</div>
                    <div className="td">{t.desc}</div>
                    {t.status === 'Rework' && t.remark && <div className="remark">Admin remark: {t.remark}</div>}
                  </td>
                  <td>{getUser(isAdmin ? t.assignee : t.assignedBy).name}</td>
                  <td>{prioBadge(t.priority)}</td>
                  <td>{dueCell(t)}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td>
                    <div className="acts">
                      {t.assignee === me.id && (t.status === 'Pending' || t.status === 'Rework') && (
                        <button className="btn sm" onClick={() => startTask(t.id)}>▶ Start</button>
                      )}
                      {t.assignee === me.id && ['Pending','In Progress','Rework'].includes(t.status) && (
                        <button className="btn ok sm" onClick={() => doneTask(t.id)}>✔ Done</button>
                      )}
                      {isAdmin && (
                        <button className="btn no sm" onClick={() => delTask(t.id)}>🗑</button>
                      )}
                      {(!isAdmin && t.assignee !== me.id) && <span className="muted">—</span>}
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={7} className="empty">Koi task nahi mila</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
