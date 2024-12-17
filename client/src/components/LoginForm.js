import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [login, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:5000/login', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();
      if (response.status === 200) {
        localStorage.setItem('token', data.access_token); 
        localStorage.setItem('role', data.role);
        const list = localStorage.getItem('user_list');
        if (!list) {
            localStorage.setItem('user_list', JSON.stringify([{ name: data.name, role: data.role, token: data.access_token }]));
        }
        navigate('/');
      } else {
        setErrorMessage(data.error || 'Неверный логин или пароль');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      setErrorMessage('Ошибка сети. Попробуйте еще раз позже.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20vh', height: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ width: 350, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyItems: 'center', 
                    backgroundColor: '#F1F1F1', 
                    border: '1px solid #CCC', 
                    borderRadius: 10,
                    height: '40vh',
                    padding: 50 }}>
        <p
          style={{
            fontSize: 70,
            marginBottom: 50,
            marginTop: 0,
            fontFamily: 'Ubuntu',
            transition: 'transform 0.1s ease',
            display: 'inline-block',
            cursor: 'default',
            textAlign: 'center'
          }}
        >
          Вход
        </p>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 30 }} onSubmit={handleSubmit}>
          <label style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            Логин
            <input
              type="text"
              name="login"
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', borderRadius: 10 }}
              value={login}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            Пароль
            <input
              type="password"
              name="password"
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', borderRadius: 10 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <div>
            <div>
              <input
                type="submit"
                value="Вход"
                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 10, cursor: 'pointer', width: '100%', textAlign: 'center' }}
              />
              {errorMessage && <p id='errors' style={{ color: 'red' }}>{errorMessage}</p>}
            </div>
          </div>
        </form>
      </div>
      <p>Курсовая работа "Отельный менеджмент"</p>
    </div>
    
    </div>
  );
}

export default Login;