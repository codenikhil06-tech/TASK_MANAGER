export const LS = 'taskflow_data_v1';
export const SS = 'taskflow_session_v1';

export const uid = () => Math.random().toString(36).slice(2, 10);
export const pad = n => String(n).padStart(2, '0');
export const fmt = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
export const todayStr = () => fmt(new Date());
export const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return fmt(d); };
export const prettyDate = s => { if (!s) return '—'; const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };
export const initials = n => n.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function seed() {
  const users = [
    { id: 'u1', name: 'Admin Sir', username: 'admin', password: 'admin123', role: 'admin', dept: 'Management' },
    { id: 'u2', name: 'Rahul Sharma', username: 'rahul', password: 'staff123', role: 'staff', dept: 'Sales' },
    { id: 'u3', name: 'Priya Verma', username: 'priya', password: 'staff123', role: 'staff', dept: 'Accounts' },
    { id: 'u4', name: 'Amit Patel', username: 'amit', password: 'staff123', role: 'staff', dept: 'Operations' }
  ];
  const T = (title, desc, a, pr, due, st, extra = {}) => ({ id: uid(), title, desc, assignee: a, assignedBy: 'u1', priority: pr, due, status: st, createdAt: addDays(-6), ...extra });
  const tasks = [
    T('Monthly sales report banana', 'Pichle mahine ki sales ka summary report ready karo', 'u2', 'High', addDays(2), 'In Progress'),
    T('Client ko follow-up call', 'Pending 5 clients ko payment follow-up', 'u2', 'Medium', addDays(-1), 'Pending'),
    T('GST return file karna', 'Is mahine ka GSTR-3B file karna', 'u3', 'High', addDays(3), 'Awaiting Approval', { doneAt: addDays(0) }),
    T('Invoice reconciliation', 'Vendor invoices ko ledger se match karo', 'u3', 'Medium', addDays(5), 'Pending'),
    T('Stock audit', 'Godown ka physical stock count', 'u4', 'High', addDays(1), 'Awaiting Approval', { doneAt: addDays(0) }),
    T('Office supplies order', 'Stationery ka order place karna', 'u4', 'Low', addDays(7), 'Pending'),
    T('Website banner update', 'Diwali offer ka banner lagana', 'u2', 'Low', addDays(-3), 'Approved', { doneAt: addDays(-4) }),
    T('Attendance sheet update', 'Weekly attendance sheet complete karo', 'u3', 'Low', addDays(4), 'Rework', { remark: 'Half-day entries missing hain, dobara check karein' })
  ];
  const holidays = [
    { id: uid(), date: '2026-10-02', name: 'Gandhi Jayanti' },
    { id: uid(), date: '2026-10-20', name: 'Dussehra' },
    { id: uid(), date: '2026-11-08', name: 'Diwali' },
    { id: uid(), date: '2026-12-25', name: 'Christmas' },
    { id: uid(), date: '2027-01-26', name: 'Republic Day' }
  ];
  return { users, tasks, delegations: [], holidays };
}

export function loadDB() {
  try {
    const d = JSON.parse(localStorage.getItem(LS));
    if (d && d.users) return d;
  } catch (e) { }
  return seed();
}

export function saveDB(DB) {
  localStorage.setItem(LS, JSON.stringify(DB));
}

export const getSession = () => localStorage.getItem(SS);
export const setSession = (id) => {
    if (id) localStorage.setItem(SS, id);
    else localStorage.removeItem(SS);
};
