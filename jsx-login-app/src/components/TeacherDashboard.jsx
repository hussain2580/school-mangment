import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/AdminDashboard.css'; // Reuse same styles

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {user?.name || 'Teacher'}!</h2>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>
        <div className="dashboard-info">
          <h3>Your Classes</h3>
          <p>Manage your assigned classes.</p>
        </div>
        <div className="dashboard-info">
          <h3>Student Performance</h3>
          <p>View and track student performance and assignments.</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
