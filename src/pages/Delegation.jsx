import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { prettyDate, todayStr, uid } from '../utils/db';
import Modal from '../components/Modal';

export default function Delegation({ showToast }) {
  const { DB, me, save } = useTaskContext();
  const [delegateTaskId, setDelegateTaskId] = useState(null);
  const [delegateTo, setDelegateTo] = useState('');
  const [delegateReason, setDelegateReason] = useState('');

  const isAdmin = me.role === 'admin';
  const scoped = isAdmin ? DB.tasks : DB.tasks.filter(t => t.assignee === me.id);
  const isOverdue = (t) => t.due < todayStr() && t.status !== 'Approved' && t.status !== 'Awaiting Approval';

  const open = scoped.filter(t => !['Approved', 'Awaiting Approval'].includes(t.status));
  const hist = DB.delegations.filter(d => isAdmin || d.from === me.id || d.to === me.id).sort((a,b) => b.date.localeCompare(a.date));

  const getUser = (id) => DB.users.find(u => u.id === id) || { name: '(removed)' };
  
  const statusBadge = s => {
    const m = {'Pending':'b-pending','In Progress':'b-prog','Awaiting Approval':'b-wait','Approved':'b-ok','Rework':'b-rework'};
    return <span className={`badge ${m[s]}`}>{s}</span>;
  };
  const dueCell = t => <span className={isOverdue(t) ? 'overdue' : ''}>{prettyDate(t.due)}{isOverdue(t) ? ' ⚠' : ''}</span>;

  const staffList = DB.users.filter(u => u.role === 'staff');
  
  const activeTask = delegateTaskId ? DB.tasks.find(t => t.id === delegateTaskId) : null;
  const opts = activeTask ? staffList.filter(u => u.id !== activeTask.assignee) : [];

  const handleDelegateSubmit = () => {
    if (!opts.length) {
      showToast('Dusra staff available nahi hai');
      return;
    }
    const toId = delegateTo || (opts[0] && opts[0].id);
    if (!toId) return;

    const newDB = { ...DB };
    const t = newDB.tasks.find(x => x.id === delegateTaskId);
    newDB.delegations.push({
      id: uid(),
      taskId: t.id,
      title: t.title,
      from: t.assignee,
      to: toId,
      reason: delegateReason.trim(),
      date: todayStr(),
      by: me.id
    });
    t.assignee = toId;
    t.status = 'Pending';
    
    save(newDB);
    showToast('Task delegate ho gaya ✔');
    setDelegateTaskId(null);
    setDelegateTo('');
    setDelegateReason('');
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Delegate karne layak Tasks <span className="muted" style={{ fontWeight: 400, fontSize: 12.5 }}>— task kisi dusre staff ko de dein</span></h3>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Abhi Kiske Paas</th>
                <th>Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {open.length > 0 ? open.map(t => (
                <tr key={t.id}>
                  <td className="tt">{t.title}</td>
                  <td>{getUser(t.assignee).name}</td>
                  <td>{dueCell(t)}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td><button className="btn sm" onClick={() => { setDelegateTaskId(t.id); setDelegateTo(''); }}>🔁 Delegate</button></td>
                </tr>
              )) : <tr><td colSpan={5} className="empty">Delegate karne ke liye koi task nahi</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h3>Delegation History</h3>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Task</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {hist.length > 0 ? hist.map(d => (
                <tr key={d.id}>
                  <td>{prettyDate(d.date)}</td>
                  <td className="tt">{d.title}</td>
                  <td>{getUser(d.from).name}</td>
                  <td>{getUser(d.to).name}</td>
                  <td className="td">{d.reason || '—'}</td>
                </tr>
              )) : <tr><td colSpan={5} className="empty">Abhi koi delegation nahi hui</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        show={!!delegateTaskId} 
        title="Task Delegate Karein" 
        onCancel={() => setDelegateTaskId(null)}
        onOk={handleDelegateSubmit}
        okLabel="Delegate"
      >
        {activeTask && (
          <>
            <p style={{ marginBottom: 12 }}><b>{activeTask.title}</b><br/><span className="muted">Abhi: {getUser(activeTask.assignee).name}</span></p>
            <div className="fg">
              <label>Kisko dena hai *</label>
              <select value={delegateTo} onChange={e => setDelegateTo(e.target.value)}>
                <option value="" disabled>Select Staff</option>
                {opts.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.dept || ''})</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label>Reason</label>
              <textarea value={delegateReason} onChange={e => setDelegateReason(e.target.value)} placeholder="Delegate karne ki wajah..."></textarea>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
