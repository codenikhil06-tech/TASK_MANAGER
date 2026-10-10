import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';

export default function Login() {
  const { DB, login } = useTaskContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const doLogin = (e) => {
    e.preventDefault();
    const u = DB.users.find(x => x.username.toLowerCase() === username.trim().toLowerCase() && x.password === password);
    if (!u) {
      setErr('Username ya password galat hai');
      return;
    }
    setErr('');
    login(u);
  };

  const fill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div id="login">
      <div className="login-box">
        <div className="logo"><span className="i">✔</span> TaskFlow</div>
        <p className="sub">Apne account se login karein</p>
        {err && <div className="err">{err}</div>}
        <form onSubmit={doLogin}>
          <div className="fg">
            <label>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username daalein" autoComplete="username" required />
          </div>
          <div className="fg">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password daalein" autoComplete="current-password" required />
          </div>
          <button className="btn block" type="submit">Login</button>
        </form>
        <div className="demo">
          <b>Demo accounts</b> (click karke fill karein)
          <button onClick={() => fill('admin','admin123')}>👑 Admin — admin / admin123</button>
          <button onClick={() => fill('rahul','staff123')}>👤 Staff — rahul / staff123</button>
          <button onClick={() => fill('priya','staff123')}>👤 Staff — priya / staff123</button>
        </div>
      </div>
    </div>
  );
}
