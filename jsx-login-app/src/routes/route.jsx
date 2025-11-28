import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import ChatDashboard from './components/ChatDashboard';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentView(userData.role);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView(userData.role);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('login');
  };

  // Render based on current view
  const renderView = () => {
    switch (currentView) {
      case 'admin':
        return <AdminDashboard onLogout={handleLogout} />;
      case 'teacher':
        return <ChatDashboard onLogout={handleLogout} />;
      case 'student':
        return <StudentDashboard />;
      default:
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;