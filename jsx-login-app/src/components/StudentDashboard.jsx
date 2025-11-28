import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaChalkboardTeacher, FaBook, FaEnvelope, FaUser, FaCircle } from 'react-icons/fa';
import '../style/StudentDashboard.css';
import ChatDashboard from './ChatDashboard';
import bg from '../Images/back-ground.png';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleChat = () => {
    setActiveTab('chat');
  };

  if (activeTab === 'chat') {
    return <ChatDashboard />;
  }

  return (
    <div className="student-dashboard" style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
      <aside className="sidebar">
        <div className="brand">Twinkle Star</div>
        <ul className="nav-list">
          <li onClick={() => setActiveTab('dashboard')}><FaTachometerAlt/> Dashboard</li>
          <li onClick={handleChat}><FaBook/> Chat</li>
          <li onClick={handleChat}><FaEnvelope/> Messages</li>
          <li><FaBook/> Assignments</li>
          <li><FaUser/> Profile</li>
          <li onClick={handleLogout} style={{marginTop:12}}><FaEnvelope/> Logout</li>
        </ul>
      </aside>

      <main className="main-area">
        <div className="welcome-card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <h2 style={{margin:0}}>Welcome, {user?.name || 'Student'}!</h2>
              <p style={{margin: '6px 0 0 0', color:'#555'}}>{user?.email}</p>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="dash-top">
          <div className="widget">
            <h3>Attendance</h3>
            <div className="stats-row">
              <div className="chart-circle chart-attendance">76%</div>
            </div>
          </div>

          <div className="widget">
            <h3>Assignments</h3>
            <div className="stats-row">
              <div className="chart-circle chart-assign">+4</div>
            </div>
          </div>

          <div className="widget">
            <h3>Results</h3>
            <div className="stats-row">
              <div className="chart-circle chart-results">A+</div>
            </div>
          </div>
          <div className="widget">
            <h3>Classes</h3>
            <div className="stats-row">
              <div className="chart-circle chart-Classes">92%</div>
            </div>
          </div>
        </div>

        <ul className="bullet-list">
          <li><FaCircle style={{fontSize:8, color:'#333'}}/> Math section 10th Updated</li>
          <li><FaCircle style={{fontSize:8, color:'#333'}}/> English Section 04 Update</li>
          <li><FaCircle style={{fontSize:8, color:'#333'}}/> You Miss Urdu Section 05</li>
          <li><FaCircle style={{fontSize:8, color:'#333'}}/> Your fee voucher need to pay</li>
          <li><FaCircle style={{fontSize:8, color:'#333'}}/> New Assignment has arrived</li>
          <li><FaCircle style={{fontSize:8, color:'#333'}}/> Your New Event coming soon</li>
          <li><FaCircle style={{fontSize:8, color:'#333'}}/> New Notice From Admin</li>
          <li><FaCircle style={{fontSize:8, color:'#333'}}/> Your Mid Term Result update</li>
        </ul>
      </main>
    </div>
  );
};

export default StudentDashboard;
