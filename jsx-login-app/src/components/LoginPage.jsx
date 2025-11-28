import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/LoginPage.css';

// Use environment variable or default to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student', // default role
    userClass: '',
    rollNo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Determine API endpoint based on role
      let loginEndpoint = '';
      switch(formData.role) {
        case 'admin':
          loginEndpoint = `${API_BASE_URL}/auth/admin/login`;
          break;
        case 'teacher':
          loginEndpoint = `${API_BASE_URL}/auth/teacher/login`;
          break;
        case 'student':
          loginEndpoint = `${API_BASE_URL}/auth/student/login`;
          break;
        default:
          throw new Error('Please select a role');
      }

      console.log('Sending login request to:', loginEndpoint);

      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success) {
        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert(`Login Successful! Welcome ${data.user.name}`);
        
        // Redirect based on role using React Router
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else if (data.user.role === 'teacher') {
          navigate('/teacher');
        } else {
          navigate('/student');
        }
      } else {
        setError(data.message || 'Login failed!');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Network error! Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Show class and roll number only for students
  const showStudentFields = formData.role === 'student';

  return (
    <div className="container">
      {/* Left Side - Content */}
      <div className="left-side">
        <div className="content">
          <img src="/Images/OIP__4_-removebg-preview.png" alt="School Logo" />
          <h1>Welcome to Learning Skills</h1>
          <p>Empowering students with knowledge and skills for a brighter future</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="right-side">
        <div className="login-form-container">
          <div className="form-header">
            <h2>LOGIN</h2>
            <p>Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Role Selection */}
            <div className="input-group">
              <label htmlFor="role">Login As</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Email Field */}
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {/* Conditional Fields for Students */}
            {showStudentFields && (
              <>
                <div className="input-group">
                  <label htmlFor="userClass">Class</label>
                  <select
                    id="userClass"
                    name="userClass"
                    value={formData.userClass}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Class</option>
                    <option value="1">Class 1</option>
                    <option value="2">Class 2</option>
                    <option value="3">Class 3</option>
                    <option value="4">Class 4</option>
                    <option value="5">Class 5</option>
                    <option value="6">Class 6</option>
                    <option value="7">Class 7</option>
                    <option value="8">Class 8</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="rollNo">Roll No</label>
                  <input
                    type="number"
                    id="rollNo"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    placeholder="Enter your roll number"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="test-credentials">
            <h4>Test Credentials:</h4>
            <p><strong>Admin:</strong> admin@school.com / admin123</p>
            <p><strong>Teacher:</strong> teacher@school.com / teacher123</p>
            <p><strong>Student:</strong> student@school.com / student123</p>
          </div>

          <div className="form-footer">
            <p>Don't have an account? <a href="#signup">Contact Admin</a></p>
            <p><a href="#forgot">Forgot Password?</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;