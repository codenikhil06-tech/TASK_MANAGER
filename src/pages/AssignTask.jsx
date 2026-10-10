import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { todayStr, addDays, uid, prettyDate } from '../utils/db';

export default function AssignTask({ showToast }) {
  const { DB, me, save } = useTaskContext();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selStaff, setSelStaff] = useState([]);
  const [prio, setPrio] = useState('Medium');
  const [dueDate, setDueDate] = useState(addDays(3));

  const staffList = DB.users.filter(u => u.role === 'staff');
  const recent = [...DB.tasks].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const toggleStaff = (id) => {
    if (selStaff.includes(id)) {
      setSelStaff(selStaff.filter(s => s !== id));
    } else {
      setSelStaff([...selStaff, id]);
    }
  };

  const assignTask = (e) => {
    e.preventDefault();
    if (!selStaff.length) {
      showToast('Kam se kam ek staff select karein');
      return;
    }
    const newDB = { ...DB };
    selStaff.forEach(s => {
      newDB.tasks.push({
        id: uid(),
        title: title.trim(),
        desc: desc.trim(),
        assignee: s,
        assignedBy: me.id,
        priority: prio,
        due: dueDate,
        status: 'Pending',
        createdAt: todayStr()
      });
    });
    save(newDB);
    showToast(`Task ${selStaff.length} staff ko assign ho gaya ✔`);
    setTitle('');
    setDesc('');
    setSelStaff([]);
    setDueDate(addDays(3));
  };

  const getUser = (id) => DB.users.find(u => u.id === id) || { name: '(removed)' };

  return (
    <div className="grid g2">
      <div className="card">
        <h3>Naya Task Assign Karein</h3>
        <form onSubmit={assignTask}>
          <div className="fg">
            <label>Task Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Jaise: Monthly report banana" />
          </div>
          <div className="fg">
            <label>Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Task ki detail likhein..."></textarea>
          </div>
          <div className="fg">
            <label>Staff Select Karein * <span className="muted" style={{ fontWeight: 400 }}>(ek ya zyada)</span></label>
            <div className="chk">
              {staffList.length > 0 ? staffList.map(u => (
                <label key={u.id}>
                  <input type="checkbox" checked={selStaff.includes(u.id)} onChange={() => toggleStaff(u.id)} /> {u.name}
                </label>
              )) : <span className="muted">Pehle Settings me staff add karein</span>}
            </div>
          </div>
          <div className="row2">
            <div className="fg">
              <label>Priority</label>
              <select value={prio} onChange={e => setPrio(e.target.value)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="fg">
              <label>Due Date *</label>
              <input type="date" min={todayStr()} value={dueDate} onChange={e => setDueDate(e.target.value)} required />
            </div>
          </div>
          <button className="btn block" type="submit">Assign Task</button>
        </form>
      </div>
      <div className="card">
        <h3>Haal hi me Assign kiye gaye</h3>
        <div className="tw">
          <table style={{ minWidth: 420 }}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Staff</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(t => (
                <tr key={t.id}>
                  <td className="tt">{t.title}</td>
                  <td>{getUser(t.assignee).name}</td>
                  <td>{prettyDate(t.due)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
