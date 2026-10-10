import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadDB, saveDB, getSession, setSession } from '../utils/db';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [DB, setDB] = useState(loadDB());
  const [me, setMe] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('taskflow_theme') || 'light');

  useEffect(() => {
    const id = getSession();
    if (id) {
      const u = DB.users.find(x => x.id === id);
      if (u) setMe(u);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskflow_theme', theme);
  }, [theme]);

  const save = (newDB) => {
    setDB(newDB);
    saveDB(newDB);
  };

  const login = (user) => {
    setMe(user);
    setSession(user.id);
  };

  const logout = () => {
    setMe(null);
    setSession(null);
  };

  const toggleTheme = () => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  };

  return (
    <TaskContext.Provider value={{ DB, save, me, login, logout, theme, toggleTheme }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTaskContext = () => useContext(TaskContext);
