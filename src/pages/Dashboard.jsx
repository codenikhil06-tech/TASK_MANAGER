import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { prettyDate } from '../utils/db';

export default function Dashboard() {
  const { DB, me } = useTaskContext();
  
  const isAdmin = me.role === 'admin';
  const scoped = isAdmin ? DB.tasks : DB.tasks.filter(t => t.assignee === me.id);
  const isOverdue = (t) => t.due < new Date().toISOString().slice(0, 10) && t.status !== 'Approved' && t.status !== 'Awaiting Approval';
  const c = (s) => scoped.filter(t => t.status === s).length;
  
  const overdue = scoped.filter(isOverdue).length;
  const staffList = DB.users.filter(u => u.role === 'staff');
  
  const stats = [
    ['Total Tasks', scoped.length, '📋', 'var(--primary-l)'],
    ['Pending', c('Pending') + c('Rework'), '⏳', 'var(--gray-l)'],
    ['In Progress', c('In Progress'), '🚀', 'var(--blue-l)'],
    ['Awaiting Approval', c('Awaiting Approval'), '🕒', 'var(--amber-l)'],
    ['Approved', c('Approved'), '🏆', 'var(--green-l)'],
    ['Overdue', overdue, '🔥', 'var(--red-l)']
  ];
  const bars = [['Pending','var(--muted)'],['In Progress','var(--blue)'],['Awaiting Approval','var(--amber)'],['Approved','var(--green)'],['Rework','var(--red)']];
  const mx = Math.max(1, ...bars.map(b => c(b[0])));
  
  const recent = [...scoped].sort((a,b) => a.due.localeCompare(b.due)).filter(t => t.status !== 'Approved').slice(0, 6);

  const getUser = (id) => DB.users.find(u => u.id === id) || { name: '(removed)' };

  const prioBadge = p => <span className={`badge p-${p}`}>{p}</span>;
  const statusBadge = s => {
    const m = {'Pending':'b-pending','In Progress':'b-prog','Awaiting Approval':'b-wait','Approved':'b-ok','Rework':'b-rework'};
    return <span className={`badge ${m[s]}`}>{s}</span>;
  };
  const dueCell = t => <span className={isOverdue(t) ? 'overdue' : ''}>{prettyDate(t.due)}{isOverdue(t) ? ' ⚠' : ''}</span>;

  return (
    <>
      <div className="sec-t">
        {isAdmin ? 'Welcome, Admin 👋' : `Namaste, ${me.name.split(' ')[0]} 👋`}
      </div>
      <div className="grid g4" style={{ marginBottom: '18px' }}>
        {stats.map((s, i) => (
          <div className="card stat" key={i}>
            <div className="ico" style={{ background: s[3] }}>{s[2]}</div>
            <div>
              <div className="v">{s[1]}</div>
              <div className="l">{s[0]}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid g2">
        <div className="card">
          <h3>Status Overview</h3>
          {bars.map((b, i) => (
            <div className="bar" key={i}>
              <div className="t"><span>{b[0]}</span><span>{c(b[0])}</span></div>
              <div className="tr">
                <div className="fl" style={{ width: `${c(b[0]) / mx * 100}%`, background: b[1] }}></div>
              </div>
            </div>
          ))}
        </div>
        {isAdmin ? (
          <div className="card">
            <h3>Staff Workload</h3>
            {staffList.length > 0 ? staffList.map(u => {
              const a = DB.tasks.filter(t => t.assignee === u.id);
              const d = a.filter(t => t.status === 'Approved').length;
              const w = a.length ? (d / a.length * 100) : 0;
              return (
                <div className="bar" key={u.id}>
                  <div className="t"><span>{u.name}</span><span>{d}/{a.length} done</span></div>
                  <div className="tr">
                    <div className="fl" style={{ width: `${w}%`, background: 'var(--primary)' }}></div>
                  </div>
                </div>
              )
            }) : <div className="empty">Koi staff nahi</div>}
          </div>
        ) : (
          <div className="card">
            <h3>Mera Kaam Aaj</h3>
            <div className="muted">
              Aapke paas <b style={{ color: 'var(--text)' }}>{c('Pending') + c('In Progress') + c('Rework')}</b> open tasks hain
              {overdue > 0 && <span> aur <b className="overdue">{overdue}</b> overdue</span>}.
            </div>
          </div>
        )}
      </div>
      <div className="card" style={{ marginTop: '16px' }}>
        <h3>Upcoming / Open Tasks</h3>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                {isAdmin && <th>Staff</th>}
                <th>Priority</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.length > 0 ? recent.map(t => (
                <tr key={t.id}>
                  <td className="tt">{t.title}</td>
                  {isAdmin && <td>{getUser(t.assignee).name}</td>}
                  <td>{prioBadge(t.priority)}</td>
                  <td>{dueCell(t)}</td>
                  <td>{statusBadge(t.status)}</td>
                </tr>
              )) : <tr><td colSpan={isAdmin ? 5 : 4} className="empty">Koi open task nahi 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
