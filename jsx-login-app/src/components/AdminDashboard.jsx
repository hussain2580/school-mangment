import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState(new Set());
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [messageInput, setMessageInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);

  // Teacher form state
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    subject: '',
    qualifications: '',
    experience: '',
    phone: '',
    address: ''
  });

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    password: '',
    class: '',
    rollNo: '',
    parentName: '',
    parentPhone: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    // Initialize chat messages
    setSelectedGroup('class10a');
    setChatMessages({
      class10a: [
        { id: 1, sender: 'Teacher', avatar: '👨‍🏫', text: 'Good morning class! Today we will learn about React hooks.', timestamp: '09:15 AM' },
        { id: 2, sender: 'Student', avatar: '👨‍🎓', text: 'Good morning sir! Looking forward to the class.', timestamp: '09:16 AM' },
        { id: 3, sender: 'Teacher', avatar: '👨‍🏫', text: 'Great! Let\'s start with useState hook.', timestamp: '09:20 AM' },
      ],
      class10b: [
        { id: 1, sender: 'Teacher', avatar: '👩‍🏫', text: 'Welcome everyone! Today\'s topic: Python Basics', timestamp: '10:00 AM' },
        { id: 2, sender: 'Student', avatar: '👩‍🎓', text: 'Hi Miss! Ready to learn.', timestamp: '10:02 AM' },
      ],
      teachers: [
        { id: 1, sender: 'Principal', avatar: '👔', text: 'Staff meeting tomorrow at 3 PM.', timestamp: '08:30 AM' },
        { id: 2, sender: 'Admin', avatar: '⚙️', text: 'Please submit attendance reports.', timestamp: '09:00 AM' },
      ],
      admin: [
        { id: 1, sender: 'You', avatar: '👤', text: 'System is running smoothly.', timestamp: '07:00 AM' },
      ],
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'teachers') {
      fetchTeachers();
    } else if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const fetchDashboardStats = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        setError('Failed to load dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Network error while fetching stats');
    }
  };

  const fetchTeachers = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/admin/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTeachers(data.teachers || []);
      } else {
        setError('Failed to load teachers');
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Network error while fetching teachers');
    }
  };

  const fetchStudents = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/admin/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.students || []);
      } else {
        setError('Failed to load students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Network error while fetching students');
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validate required fields
    if (!teacherForm.name.trim() || !teacherForm.email.trim() || !teacherForm.subject.trim()) {
      setError('Name, email, and subject are required');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/admin/create-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teacherForm)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`✅ Teacher created successfully!\nEmail: ${data.teacher.email}\nPassword: ${data.teacher.password}`);
        setTeacherForm({
          name: '',
          email: '',
          password: '',
          subject: '',
          qualifications: '',
          experience: '',
          phone: '',
          address: ''
        });
        setTimeout(() => {
          fetchTeachers();
          setSuccessMessage('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create teacher');
      }
    } catch (error) {
      console.error('Error creating teacher:', error);
      setError('Network error while creating teacher: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validate required fields
    if (!studentForm.name.trim() || !studentForm.email.trim() || !studentForm.class || !studentForm.rollNo) {
      setError('Name, email, class, and roll number are required');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/admin/create-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentForm)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`✅ Student created successfully!\nEmail: ${data.student.email}\nPassword: ${data.student.password}\nClass: ${data.student.class}\nRoll No: ${data.student.rollNo}`);
        setStudentForm({
          name: '',
          email: '',
          password: '',
          class: '',
          rollNo: '',
          parentName: '',
          parentPhone: '',
          phone: '',
          address: ''
        });
        setTimeout(() => {
          fetchStudents();
          setSuccessMessage('');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create student');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      setError('Network error while creating student: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId, userType) => {
    if (!window.confirm(`Are you sure you want to reset password for this ${userType}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/auth/admin/reset-password/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: '' })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`✅ Password reset successfully!\nNew Password: ${data.newPassword}`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Network error while resetting password: ' + error.message);
    }
  };

  const handleBlockUser = async (userId, userName, userType) => {
    if (!window.confirm(`Are you sure you want to block ${userName}?`)) {
      return;
    }

    try {
      setError('');
      // Add to blocked set (user stays in list but marked as blocked)
      setBlockedUsers(prev => new Set([...prev, userId]));
      setSuccessMessage(`✅ ${userName} (${userType}) has been blocked! They can unblock them later.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error blocking user:', error);
      setError('Error blocking user: ' + error.message);
    }
  };

  const handleUnblockUser = async (userId, userName, userType) => {
    if (!window.confirm(`Are you sure you want to unblock ${userName}?`)) {
      return;
    }

    try {
      setError('');
      // Remove from blocked set
      const newBlocked = new Set(blockedUsers);
      newBlocked.delete(userId);
      setBlockedUsers(newBlocked);
      setSuccessMessage(`✅ ${userName} (${userType}) has been unblocked successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error unblocking user:', error);
      setError('Error unblocking user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId, userName, userType) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${userName}? This cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      // Mock implementation: filter out the user from the list
      if (userType === 'teacher') {
        setTeachers(teachers.filter(t => (t.id || t._id) !== userId));
        setSuccessMessage(`✅ ${userName} (Teacher) has been deleted permanently!`);
      } else {
        setStudents(students.filter(s => (s.id || s._id) !== userId));
        setSuccessMessage(`✅ ${userName} (Student) has been deleted permanently!`);
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error deleting user: ' + error.message);
    }
  };

  const handleSendMessage = () => {
    if ((!messageInput.trim() && !attachedFile) || !selectedGroup) return;

    const newMessage = {
      id: Math.max(...(chatMessages[selectedGroup]?.map(m => m.id) || [0])) + 1,
      sender: 'You',
      avatar: '👤',
      text: messageInput,
      file: attachedFile,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedGroup]: [...(prev[selectedGroup] || []), newMessage]
    }));

    setMessageInput('');
    setAttachedFile(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSize = file.size / 1024 / 1024; // MB
    if (fileSize > 50) {
      setError('File size must be less than 50MB');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = {
        name: file.name,
        type: file.type,
        size: fileSize.toFixed(2),
        data: event.target?.result
      };
      setAttachedFile(fileData);
    };
    reader.readAsDataURL(file);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio({
          data: audioUrl,
          duration: recordingTime
        });
        setIsRecording(false);
        setRecordingTime(0);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      setError('Microphone access denied. Please allow microphone permissions.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const sendVoiceMessage = () => {
    if (!recordedAudio || !selectedGroup) return;

    const newMessage = {
      id: Math.max(...(chatMessages[selectedGroup]?.map(m => m.id) || [0])) + 1,
      sender: 'You',
      avatar: '🎤',
      text: `Voice message (${formatTime(recordedAudio.duration)})`,
      voice: recordedAudio,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedGroup]: [...(prev[selectedGroup] || []), newMessage]
    }));

    setRecordedAudio(null);
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="admin-nav">
        <button 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-tab ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => setActiveTab('teachers')}
        >
          Manage Teacher
        </button>
        <button 
          className={`nav-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Manage Student
        </button>
        <button 
          className={`nav-tab ${activeTab === 'groups' ? 'active' : ''}`}
          onClick={() => setActiveTab('groups')}
        >
          Chat Groups
        </button>
      </nav>

      {/* Error & Success Messages */}
      {error && (
        <div className="alert alert-error">
          ❌ {error}
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
          <button className="alert-close" onClick={() => setSuccessMessage('')}>×</button>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-tab">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Students</h3>
              <p className="stat-number">{stats.totalStudents || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Teachers</h3>
              <p className="stat-number">{stats.totalTeachers || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Tasks</h3>
              <p className="stat-number">{stats.pendingTasks || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Fee Records</h3>
              <p className="stat-number">{stats.totalFees || 0}</p>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <button onClick={() => setActiveTab('teachers')}>
                Create New Teacher
              </button>
              <button onClick={() => setActiveTab('students')}>
                Create New Student
              </button>
            </div>
          </div>

          {/* Event Card */}
          <div className="event-card">
            <div className="event-content">
              <h2>Annual Supports Event 2025</h2>
              <p className="event-date">04 Jan 2026 Starting Day</p>
              <p className="event-description">
                Join us for the Annual Supports Event 2025! This is a great opportunity to connect with students, 
                teachers, and parents. We'll have various activities, discussions, and networking sessions planned for everyone.
              </p>
              <button className="event-btn">Learn More</button>
            </div>
            <div className="event-image">
              <img className="event-pic"src="../Images/OIP (5).jpg" alt="Event" />
            </div>
          </div>
        </div>
      )}

      {/* Teachers Tab */}
      {activeTab === 'teachers' && (
        <div className="teachers-tab">
          <div className="tab-content">
            <div className="create-form">
              <h2>Create New Teacher</h2>
              <form onSubmit={handleCreateTeacher}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="text"
                      value={teacherForm.password}
                      onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})}
                      placeholder="Leave empty for auto-generate"
                    />
                  </div>
                  <div className="form-group">
                    <label>Subject *</label>
                    <input
                      type="text"
                      value={teacherForm.subject}
                      onChange={(e) => setTeacherForm({...teacherForm, subject: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Qualifications</label>
                    <input
                      type="text"
                      value={teacherForm.qualifications}
                      onChange={(e) => setTeacherForm({...teacherForm, qualifications: e.target.value})}
                      placeholder="B.Ed, M.Ed, etc."
                    />
                  </div>
                  <div className="form-group">
                    <label>Experience (Years)</label>
                    <input
                      type="number"
                      value={teacherForm.experience}
                      onChange={(e) => setTeacherForm({...teacherForm, experience: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={teacherForm.address}
                    onChange={(e) => setTeacherForm({...teacherForm, address: e.target.value})}
                    rows="3"
                  />
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Creating...' : 'Create Teacher'}
                </button>
              </form>
            </div>

            <div className="users-list">
              <h2>All Teachers ({teachers.length})</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(teacher => {
                      const isBlocked = blockedUsers.has(teacher.id || teacher._id);
                      return (
                        <tr key={teacher.id || teacher._id} className={isBlocked ? 'blocked-row' : ''}>
                          <td>{teacher.name} {isBlocked && <span className="blocked-badge">🚫 BLOCKED</span>}</td>
                          <td>{teacher.email}</td>
                          <td>{teacher.subject}</td>
                          <td>{teacher.phone || 'N/A'}</td>
                          <td className="action-cell">
                            <button 
                              className="action-btn reset-btn"
                              onClick={() => handleResetPassword(teacher.id || teacher._id, 'teacher')}
                              title="Reset password"
                              disabled={isBlocked}
                            >
                              🔑 Reset
                            </button>
                            {!isBlocked ? (
                              <button 
                                className="action-btn block-btn"
                                onClick={() => handleBlockUser(teacher.id || teacher._id, teacher.name, 'teacher')}
                                title="Block user"
                              >
                                🚫 Block
                              </button>
                            ) : (
                              <button 
                                className="action-btn unblock-btn"
                                onClick={() => handleUnblockUser(teacher.id || teacher._id, teacher.name, 'teacher')}
                                title="Unblock user"
                              >
                                ✅ Unblock
                              </button>
                            )}
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteUser(teacher.id || teacher._id, teacher.name, 'teacher')}
                              title="Delete user"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="Events-section">
            <rows>
              <column>
                <div className="event-card">
                  <h3>Annual Sports Day</h3>
                  <p>Date: 25th Dec 2024</p>
                  <p>Location: School Grounds</p>
                  </div>
                  </column>
                  <column>
                  <div className="event-card">
                    <img src="https://img.icons8.com/ios-filled/50/000000/music--v1.png" alt="Music Icon"/>
                    </div>
                  </column>
            </rows>

          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="students-tab">
          <div className="tab-content">
            <div className="create-form">
              <h2>Create New Student</h2>
              <form onSubmit={handleCreateStudent}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="text"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                      placeholder="Leave empty for auto-generate"
                    />
                  </div>
                  <div className="form-group">
                    <label>Class *</label>
                    <select
                      value={studentForm.class}
                      onChange={(e) => setStudentForm({...studentForm, class: e.target.value})}
                      required
                    >
                      <option value="">Select Class</option>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                        <option key={num} value={num}>Class {num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Roll No *</label>
                    <input
                      type="number"
                      value={studentForm.rollNo}
                      onChange={(e) => setStudentForm({...studentForm, rollNo: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Parent Name</label>
                    <input
                      type="text"
                      value={studentForm.parentName}
                      onChange={(e) => setStudentForm({...studentForm, parentName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Parent Phone</label>
                    <input
                      type="tel"
                      value={studentForm.parentPhone}
                      onChange={(e) => setStudentForm({...studentForm, parentPhone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Student Phone</label>
                    <input
                      type="tel"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={studentForm.address}
                    onChange={(e) => setStudentForm({...studentForm, address: e.target.value})}
                    rows="3"
                  />
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Creating...' : 'Create Student'}
                </button>
              </form>
            </div>

            <div className="users-list">
              <h2>All Students ({students.length})</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Class</th>
                      <th>Roll No</th>
                      <th>Parent</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const isBlocked = blockedUsers.has(student.id || student._id);
                      return (
                        <tr key={student.id || student._id} className={isBlocked ? 'blocked-row' : ''}>
                          <td>{student.name} {isBlocked && <span className="blocked-badge">🚫 BLOCKED</span>}</td>
                          <td>{student.email}</td>
                          <td>Class {student.class}</td>
                          <td>{student.rollNo}</td>
                          <td>{student.parentName || 'N/A'}</td>
                          <td className="action-cell">
                            <button 
                              className="action-btn reset-btn"
                              onClick={() => handleResetPassword(student.id || student._id, 'student')}
                              title="Reset password"
                              disabled={isBlocked}
                            >
                              🔑 Reset
                            </button>
                            {!isBlocked ? (
                              <button 
                                className="action-btn block-btn"
                                onClick={() => handleBlockUser(student.id || student._id, student.name, 'student')}
                                title="Block user"
                              >
                                🚫 Block
                              </button>
                            ) : (
                              <button 
                                className="action-btn unblock-btn"
                                onClick={() => handleUnblockUser(student.id || student._id, student.name, 'student')}
                                title="Unblock user"
                              >
                                ✅ Unblock
                              </button>
                            )}
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteUser(student.id || student._id, student.name, 'student')}
                              title="Delete user"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Groups Tab */}
      {activeTab === 'groups' && (
        <div className="groups-tab">
          <div className="chat-container">
            {/* Groups Sidebar */}
            <aside className="groups-sidebar">
              <h3>Groups</h3>
              <div className="groups-list">
                <div
                  className={`group-item ${selectedGroup === 'class10a' ? 'active' : ''}`}
                  onClick={() => setSelectedGroup('class10a')}
                >
                  <div className="group-avatar">📚</div>
                  <div className="group-info">
                    <p className="group-name">Class 10-A</p>
                    <p className="group-preview">25 members</p>
                  </div>
                </div>
                <div
                  className={`group-item ${selectedGroup === 'class10b' ? 'active' : ''}`}
                  onClick={() => setSelectedGroup('class10b')}
                >
                  <div className="group-avatar">📚</div>
                  <div className="group-info">
                    <p className="group-name">Class 10-B</p>
                    <p className="group-preview">28 members</p>
                  </div>
                </div>
                <div
                  className={`group-item ${selectedGroup === 'teachers' ? 'active' : ''}`}
                  onClick={() => setSelectedGroup('teachers')}
                >
                  <div className="group-avatar">👨‍🏫</div>
                  <div className="group-info">
                    <p className="group-name">Teachers</p>
                    <p className="group-preview">15 members</p>
                  </div>
                </div>
                <div
                  className={`group-item ${selectedGroup === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedGroup('admin')}
                >
                  <div className="group-avatar">⚙️</div>
                  <div className="group-info">
                    <p className="group-name">Admin</p>
                    <p className="group-preview">3 members</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Chat Area */}
            <section className="chat-area">
              {selectedGroup && (
                <>
                  {/* Chat Header */}
                  <div className="chat-header">
                    <h2>
                      {selectedGroup === 'class10a' && 'Class 10-A'}
                      {selectedGroup === 'class10b' && 'Class 10-B'}
                      {selectedGroup === 'teachers' && 'Teachers Group'}
                      {selectedGroup === 'admin' && 'Admin Group'}
                    </h2>
                    <p>
                      {selectedGroup === 'class10a' && '25 members'}
                      {selectedGroup === 'class10b' && '28 members'}
                      {selectedGroup === 'teachers' && '15 members'}
                      {selectedGroup === 'admin' && '3 members'}
                    </p>
                  </div>

                  {/* Messages Area */}
                  <div className="messages-area">
                    {chatMessages[selectedGroup]?.map(message => (
                      <div key={message.id} className={`message ${message.sender === 'You' ? 'sent' : 'received'}`}>
                        <div className="message-avatar">{message.avatar}</div>
                        <div className="message-content">
                          <div className="message-header">
                            <span className="sender-name">{message.sender}</span>
                            <span className="timestamp">{message.timestamp}</span>
                          </div>
                          {message.text && <div className="message-text">{message.text}</div>}
                          {message.voice && (
                            <div className="message-voice">
                              <audio controls className="voice-player">
                                <source src={message.voice.data} type="audio/mp3" />
                                Your browser does not support audio.
                              </audio>
                              <span className="voice-duration">{formatTime(message.voice.duration)}</span>
                            </div>
                          )}
                          {message.file && (
                            <div className="message-file">
                              {message.file.type.startsWith('image/') && (
                                <img src={message.file.data} alt="Shared image" className="message-image" />
                              )}
                              {message.file.type.startsWith('video/') && (
                                <video controls className="message-video">
                                  <source src={message.file.data} type={message.file.type} />
                                  Your browser does not support video.
                                </video>
                              )}
                              {(message.file.type.includes('pdf') || message.file.type.includes('document') || message.file.type.includes('word')) && (
                                <div className="message-pdf">
                                  <div className="pdf-icon">📄</div>
                                  <div className="pdf-info">
                                    <p className="pdf-name">{message.file.name}</p>
                                    <p className="pdf-size">{message.file.size} MB</p>
                                  </div>
                                  <a href={message.file.data} download={message.file.name} className="pdf-download">
                                    ⬇️
                                  </a>
                                </div>
                              )}
                              {!message.file.type.startsWith('image/') && !message.file.type.startsWith('video/') && !message.file.type.includes('pdf') && !message.file.type.includes('document') && !message.file.type.includes('word') && (
                                <div className="message-file-generic">
                                  <div className="file-icon">📎</div>
                                  <div className="file-info">
                                    <p className="file-name">{message.file.name}</p>
                                    <p className="file-size">{message.file.size} MB</p>
                                  </div>
                                  <a href={message.file.data} download={message.file.name} className="file-download">
                                    ⬇️
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="chat-input-area">
                    {isRecording && (
                      <div className="recording-indicator">
                        <div className="recording-dot"></div>
                        <span>Recording... {formatTime(recordingTime)}</span>
                      </div>
                    )}
                    
                    {recordedAudio && !isRecording && (
                      <div className="recorded-preview">
                        <audio controls className="voice-preview">
                          <source src={recordedAudio.data} type="audio/mp3" />
                        </audio>
                        <button className="discard-voice-btn" onClick={() => setRecordedAudio(null)}>✕</button>
                      </div>
                    )}

                    <div className="input-wrapper">
                      <textarea
                        className="chat-input"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        rows="2"
                        disabled={isRecording}
                      />
                      <label className="file-upload-label" title="Upload file">
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          accept="image/*,video/*,.pdf,.doc,.docx"
                          style={{ display: 'none' }}
                          disabled={isRecording}
                        />
                        📎
                      </label>
                      {!isRecording ? (
                        <button 
                          className="voice-record-btn"
                          onClick={startRecording}
                          title="Record voice message"
                        >
                          🎤
                        </button>
                      ) : (
                        <button 
                          className="voice-stop-btn"
                          onClick={stopRecording}
                          title="Stop recording"
                        >
                          ⏹️
                        </button>
                      )}
                    </div>
                    {attachedFile && (
                      <div className="attached-file-preview">
                        <span className="file-preview-name">{attachedFile.name}</span>
                        <button
                          className="remove-file-btn"
                          onClick={() => setAttachedFile(null)}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <div className="send-buttons">
                      {recordedAudio && !isRecording && (
                        <button className="send-voice-btn" onClick={sendVoiceMessage}>
                          Send Voice
                        </button>
                      )}
                      <button 
                        className="send-btn" 
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() && !attachedFile && !recordedAudio}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;