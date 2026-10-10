import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { prettyDate, initials } from '../utils/db';
import Modal from '../components/Modal';

export default function Approval({ showToast }) {
  const { DB, save } = useTaskContext();
  const [rejectId, setRejectId] = useState(null);
  const [remark, setRemark] = useState('');

  const wait = DB.tasks.filter(t => t.status === 'Awaiting Approval');
  const done = DB.tasks.filter(t => t.status === 'Approved').sort((a,b) => (b.doneAt || '').localeCompare(a.doneAt || '')).slice(0, 8);

  const getUser = (id) => DB.users.find(u => u.id === id) || { name: '(removed)' };
  const prioBadge = p => <span className={`badge p-${p}`}>{p}</span>;

  const approve = (id) => {
    const newDB = { ...DB };
    const t = newDB.tasks.find(x => x.id === id);
    if (t) {
      t.status = 'Approved';
      save(newDB);
      showToast('Task approve ho gaya ✔');
    }
  };

  const submitReject = () => {
    if (!remark.trim()) {
      showToast('Remark likhna zaroori hai');
      return;
    }
    const newDB = { ...DB };
    const t = newDB.tasks.find(x => x.id === rejectId);
    if (t) {
      t.status = 'Rework';
      t.remark = remark.trim();
      save(newDB);
      showToast('Task rework ke liye wapas bheja');
    }
    setRejectId(null);
    setRemark('');
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Approval ka Intezaar ({wait.length})</h3>
        {wait.length > 0 ? wait.map(t => (
          <div key={t.id} className="apc">
            <div className="avatar">{initials(getUser(t.assignee).name)}</div>
            <div className="info">
              <div className="tt" style={{ fontSize: 15 }}>{t.title}</div>
              <div className="td" style={{ maxWidth: 'none' }}>{t.desc}</div>
              <div style={{ marginTop: 6, fontSize: 12.5 }} className="muted">
                👤 {getUser(t.assignee).name} • Due: {prettyDate(t.due)} • Done: {prettyDate(t.doneAt)} • {prioBadge(t.priority)}
              </div>
            </div>
            <div className="acts">
              <button className="btn ok" onClick={() => approve(t.id)}>✔ Approve</button>
              <button className="btn no" onClick={() => setRejectId(t.id)}>✖ Reject</button>
            </div>
          </div>
        )) : <div className="empty">Koi task approval ke liye pending nahi 🎉</div>}
      </div>

      <div className="card">
        <h3>Haal hi me Approved</h3>
        <div className="tw">
          <table style={{ minWidth: 480 }}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Staff</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {done.length > 0 ? done.map(t => (
                <tr key={t.id}>
                  <td className="tt">{t.title}</td>
                  <td>{getUser(t.assignee).name}</td>
                  <td>{prettyDate(t.doneAt)}</td>
                </tr>
              )) : <tr><td colSpan={3} className="empty">Abhi kuch approve nahi hua</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={!!rejectId} title="Task Reject Karein" onCancel={() => { setRejectId(null); setRemark(''); }} onOk={submitReject} okLabel="Reject">
        <div className="fg">
          <label>Reason / Remark *</label>
          <textarea value={remark} onChange={e => setRemark(e.target.value)} placeholder="Staff ko kya sudhaarna hai?"></textarea>
        </div>
      </Modal>
    </>
  );
}
