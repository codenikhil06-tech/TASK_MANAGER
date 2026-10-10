import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { todayStr, prettyDate, uid } from '../utils/db';
import Modal from '../components/Modal';

export default function Holiday({ showToast }) {
  const { DB, me, save } = useTaskContext();
  const [showAdd, setShowAdd] = useState(false);
  const [hName, setHName] = useState('');
  const [hDate, setHDate] = useState('');

  const isAdmin = me.role === 'admin';
  const hs = [...DB.holidays].sort((a,b) => a.date.localeCompare(b.date));

  const dn = d => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long' });

  const delHoliday = (id) => {
    if (!window.confirm('Holiday hatayein?')) return;
    const newDB = { ...DB, holidays: DB.holidays.filter(h => h.id !== id) };
    save(newDB);
  };

  const addHoliday = () => {
    if (!hName.trim() || !hDate) {
      showToast('Naam aur date dono bharein');
      return;
    }
    const newDB = { ...DB };
    newDB.holidays.push({ id: uid(), date: hDate, name: hName.trim() });
    save(newDB);
    showToast('Holiday add ho gaya');
    setShowAdd(false);
    setHName('');
    setHDate('');
  };

  return (
    <>
      <div className="toolbar">
        <div className="sec-t" style={{ margin: 0 }}>Holiday List</div>
        <div className="sp"></div>
        {isAdmin && <button className="btn" onClick={() => setShowAdd(true)}>➕ Holiday Add Karein</button>}
      </div>
      <div className="card">
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Din</th>
                <th>Holiday</th>
                <th>Baaki Din</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {hs.length > 0 ? hs.map(h => {
                const diff = Math.round((new Date(h.date + 'T00:00:00') - new Date(todayStr() + 'T00:00:00')) / 864e5);
                return (
                  <tr key={h.id}>
                    <td className="tt">{prettyDate(h.date)}</td>
                    <td>{dn(h.date)}</td>
                    <td>🎉 {h.name}</td>
                    <td>{diff < 0 ? <span className="muted">Beet gaya</span> : diff === 0 ? <b style={{ color: 'var(--green)' }}>Aaj</b> : diff + ' din'}</td>
                    {isAdmin && <td><button className="btn no sm" onClick={() => delHoliday(h.id)}>🗑</button></td>}
                  </tr>
                );
              }) : <tr><td colSpan={isAdmin ? 5 : 4} className="empty">Koi holiday nahi</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal show={showAdd} title="Holiday Add Karein" onCancel={() => setShowAdd(false)} onOk={addHoliday} okLabel="Add">
        <div className="fg">
          <label>Holiday Naam *</label>
          <input value={hName} onChange={e => setHName(e.target.value)} placeholder="Jaise: Holi" />
        </div>
        <div className="fg">
          <label>Date *</label>
          <input type="date" value={hDate} onChange={e => setHDate(e.target.value)} />
        </div>
      </Modal>
    </>
  );
}
