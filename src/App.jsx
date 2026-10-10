import React, { useState } from 'react';
import { useTaskContext } from './context/TaskContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import TaskManager from './pages/TaskManager';
import AssignTask from './pages/AssignTask';
import Delegation from './pages/Delegation';
import Calendar from './pages/Calendar';
import Holiday from './pages/Holiday';
import Approval from './pages/Approval';
import Settings from './pages/Settings';
import Toast from './components/Toast';

const PAGES = [
  { id: 'dashboard', label: 'Dashboard', ic: '📊', roles: ['admin', 'staff'], Component: Dashboard },
  { id: 'tasks', label: 'Task Manager', ic: '✅', roles: ['admin', 'staff'], Component: TaskManager },
  { id: 'assign', label: 'Assign Task', ic: '➕', roles: ['admin'], Component: AssignTask },
  { id: 'delegation', label: 'Delegation Task', ic: '🔁', roles: ['admin', 'staff'], Component: Delegation },
  { id: 'calendar', label: 'Calendar', ic: '📅', roles: ['admin', 'staff'], Component: Calendar },
  { id: 'holiday', label: 'Holiday', ic: '🎉', roles: ['admin', 'staff'], Component: Holiday },
  { id: 'approval', label: 'Admin Approval', ic: '🛡️', roles: ['admin'], Component: Approval },
  { id: 'settings', label: 'Settings', ic: '⚙️', roles: ['admin', 'staff'], Component: Settings }
];

function App() {
  const { me, DB } = useTaskContext();
  const [page, setPage] = useState('dashboard');
  const [sideOpen, setSideOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  if (!me) {
    return <Login />;
  }

  const navPages = PAGES.filter(p => p.roles.includes(me.role));
  const currentPage = navPages.find(p => p.id === page) || navPages[0];
  const ActiveComponent = currentPage.Component;
  
  const pend = DB.tasks.filter(t => t.status === 'Awaiting Approval').length;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2600);
  };

  return (
    <div id="app">
      <div className={`overlay ${sideOpen ? 'show' : ''}`} onClick={() => setSideOpen(false)}></div>
      <Sidebar 
        pages={navPages} 
        page={page} 
        setPage={(p) => { setPage(p); setSideOpen(false); window.scrollTo(0,0); }} 
        pend={pend} 
        isOpen={sideOpen}
      />
      <main>
        <Topbar 
          title={currentPage.label} 
          toggleSide={() => setSideOpen(true)} 
        />
        <div id="content">
          <ActiveComponent showToast={showToast} />
        </div>
      </main>
      <Toast msg={toastMsg} />
    </div>
  );
}

export default App;
