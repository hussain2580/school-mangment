import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// Add token to requests automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/me'),
};

// Admin APIs
export const adminAPI = {
    createTeacher: (data) => api.post('/admin/create-teacher', data),
    createStudent: (data) => api.post('/admin/create-student', data),
    getTeachers: () => api.get('/admin/teachers'),
    getStudents: () => api.get('/admin/students'),
};

// Teacher APIs
export const teacherAPI = {
    getStudents: () => api.get('/teacher/students'),
    getProfile: () => api.get('/teacher/profile'),
};

// Student APIs  
export const studentAPI = {
    getProfile: () => api.get('/student/profile'),
};

export default api;