const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory user storage (initialized with default users)
const allUsers = [
  { id: 'admin-1', email: 'admin@school.com', password: 'admin123', name: 'Admin User', role: 'admin' },
  { id: 'teacher-1', email: 'teacher@school.com', password: 'teacher123', name: 'Teacher User', role: 'teacher' },
  { id: 'student-1', email: 'student@school.com', password: 'student123', name: 'Student User', role: 'student', userClass: 'class10a' }
];

// In-memory lists for teachers and students created via admin
const adminTeachers = [{ id: 'teacher-1', name: 'Teacher User', email: 'teacher@school.com', subject: 'General' }];
const adminStudents = [];

// Helper to create a mock token
function createToken(role) {
  return `mock-token-${role}`;
}

// Login route for admin/teacher/student
app.post('/api/auth/:role/login', (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;

  console.log(`Login attempt - Role: ${role}, Email: ${email}, Password: ${password}`);

  // Find user by email and role in allUsers
  const user = allUsers.find(u => u.email === email && u.role === role);
  
  if (!user) {
    console.log(`User not found for role: ${role}, email: ${email}`);
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (password !== user.password) {
    console.log(`Password mismatch for user: ${email}`);
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = createToken(role);
  console.log(`Login successful for role: ${role}, email: ${email}`);
  const userData = { name: user.name, email: user.email, role: user.role, id: user.id };
  
  // Include class info for students
  if (role === 'student' && user.userClass) {
    userData.userClass = user.userClass;
  }
  
  return res.json({ success: true, token, user: userData });
});

// Simple authenticated endpoint
app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = auth.replace('Bearer ', '');

  // Validate token format: mock-token-<role>
  const match = token.match(/^mock-token-(admin|teacher|student)$/);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  const role = match[1];
  const user = users[role];
  return res.json({ success: true, user: { name: user.name, email: user.email, role: user.role } });
});

// Example admin route
app.get('/api/admin/teachers', (req, res) => {
  return res.json({ success: true, teachers: adminTeachers });
});

// Create teacher (mock) - requires Bearer mock-token-admin
app.post('/api/admin/create-teacher', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = auth.replace('Bearer ', '');
  if (token !== 'mock-token-admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: admin token required' });
  }

  const { name, email, password, subject, qualifications, phone } = req.body;
  
  // Check if email already exists
  if (allUsers.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const id = 'teacher-' + Math.random().toString(36).substr(2, 9);
  const teacherPassword = password || 'teacher123';
  
  // Add to allUsers so they can log in
  const newTeacher = { id, name: name || `Teacher ${id}`, email, password: teacherPassword, role: 'teacher' };
  allUsers.push(newTeacher);
  
  // Add to adminTeachers list
  const teacher = { id, name: newTeacher.name, email, subject: subject || '', qualifications: qualifications || [], phone: phone || '' };
  adminTeachers.push(teacher);

  return res.status(201).json({ success: true, message: 'Teacher created successfully (mock)', teacher: { ...teacher, password: teacherPassword } });
});

// Create student (mock) - requires Bearer mock-token-admin
app.post('/api/admin/create-student', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = auth.replace('Bearer ', '');
  if (token !== 'mock-token-admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: admin token required' });
  }

  const { name, email, password, class: studentClass, rollNo, parentName, parentPhone, phone } = req.body;
  
  // Check if email already exists
  if (allUsers.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const id = 'student-' + Math.random().toString(36).substr(2, 9);
  const studentPassword = password || 'student123';
  
  // Add to allUsers so they can log in - INCLUDE userClass
  const newStudent = { id, name: name || `Student ${id}`, email, password: studentPassword, role: 'student', userClass: studentClass || 'class10a' };
  allUsers.push(newStudent);
  
  // Add to adminStudents list
  const student = { id, name: newStudent.name, email, class: studentClass || 'class10a', rollNo: rollNo || '', parentName: parentName || '', parentPhone: parentPhone || '', phone: phone || '' };
  adminStudents.push(student);

  return res.status(201).json({ success: true, message: 'Student created successfully (mock)', student: { ...student, password: studentPassword } });
});

// --- Alias routes under /api/auth/admin/* to match frontend paths ---

function verifyAdminAuthHeader(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return { ok: false, code: 401, message: 'No token provided' };
  const token = auth.replace('Bearer ', '');
  if (token !== 'mock-token-admin') return { ok: false, code: 403, message: 'Forbidden: admin token required' };
  return { ok: true };
}

app.get('/api/auth/admin/teachers', (req, res) => {
  return res.json({ success: true, teachers: adminTeachers });
});

app.get('/api/auth/admin/students', (req, res) => {
  return res.json({ success: true, students: adminStudents });
});

app.post('/api/auth/admin/create-teacher', (req, res) => {
  const v = verifyAdminAuthHeader(req);
  if (!v.ok) return res.status(v.code).json({ success: false, message: v.message });
  
  const { name, email, password, subject, qualifications, phone } = req.body;
  
  // Check if email already exists
  if (allUsers.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const id = 'teacher-' + Math.random().toString(36).substr(2, 9);
  const teacherPassword = password || 'teacher123';
  
  // Add to allUsers so they can log in
  const newTeacher = { id, name: name || `Teacher ${id}`, email, password: teacherPassword, role: 'teacher' };
  allUsers.push(newTeacher);
  
  // Add to adminTeachers list
  const teacher = { id, name: newTeacher.name, email, subject: subject || '', qualifications: qualifications || [], phone: phone || '' };
  adminTeachers.push(teacher);

  return res.status(201).json({ success: true, message: 'Teacher created successfully (mock)', teacher: { ...teacher, password: teacherPassword } });
});

app.post('/api/auth/admin/create-student', (req, res) => {
  const v = verifyAdminAuthHeader(req);
  if (!v.ok) return res.status(v.code).json({ success: false, message: v.message });
  
  const { name, email, password, class: studentClass, rollNo, parentName, parentPhone, phone } = req.body;
  
  // Check if email already exists
  if (allUsers.find(u => u.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const id = 'student-' + Math.random().toString(36).substr(2, 9);
  const studentPassword = password || 'student123';
  
  // Add to allUsers so they can log in
  const newStudent = { id, name: name || `Student ${id}`, email, password: studentPassword, role: 'student' };
  allUsers.push(newStudent);
  
  // Add to adminStudents list
  const student = { id, name: newStudent.name, email, class: studentClass || '', rollNo: rollNo || '', parentName: parentName || '', parentPhone: parentPhone || '', phone: phone || '' };
  adminStudents.push(student);

  return res.status(201).json({ success: true, message: 'Student created successfully (mock)', student: { ...student, password: studentPassword } });
});

app.get('/api/auth/admin/dashboard', (req, res) => {
  const v = verifyAdminAuthHeader(req);
  if (!v.ok) return res.status(v.code).json({ success: false, message: v.message });
  const stats = {
    totalStudents: adminStudents.length,
    totalTeachers: adminTeachers.length,
    pendingTasks: 0,
    totalFees: 0
  };
  return res.json({ success: true, stats });
});

// In-memory chat messages storage (grouped by chatId)
const chatStorage = {};

// Get or create a chat room
const getChatRoom = (chatId) => {
  if (!chatStorage[chatId]) {
    chatStorage[chatId] = {
      id: chatId,
      messages: [],
      createdAt: new Date()
    };
  }
  return chatStorage[chatId];
};

// Send message API
app.post('/api/chat/send', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const { chatId, text, sender, avatar, voice, file } = req.body;

  if (!chatId || !sender) {
    return res.status(400).json({ success: false, message: 'Missing chatId or sender' });
  }

  const chat = getChatRoom(chatId);
  const newMessage = {
    id: chat.messages.length + 1,
    sender,
    avatar,
    text: text || '',
    voice: voice || null,
    file: file || null,
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date()
  };

  chat.messages.push(newMessage);

  return res.status(201).json({ 
    success: true, 
    message: 'Message sent successfully',
    data: newMessage 
  });
});

// Get messages for a chat
app.get('/api/chat/messages/:chatId', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const { chatId } = req.params;
  const chat = getChatRoom(chatId);

  return res.json({ 
    success: true, 
    messages: chat.messages 
  });
});

// Get all chats for a user (group and personal)
app.get('/api/chat/list/:userRole', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const { userRole } = req.params;
  const chats = [];

  if (userRole === 'student') {
    chats.push({
      id: 'group-class10a',
      type: 'group',
      name: 'Class 10-A',
      avatar: '📚',
      members: 25
    });
    chats.push({
      id: 'teacher-msg-1',
      type: 'personal',
      name: 'Mr. Ahmed (Math Teacher)',
      avatar: '👨‍🏫'
    });
  } else if (userRole === 'teacher') {
    chats.push({
      id: 'group-class10a',
      type: 'group',
      name: 'Class 10-A',
      avatar: '📚',
      members: 25
    });
    chats.push({
      id: 'group-class10b',
      type: 'group',
      name: 'Class 10-B',
      avatar: '📚',
      members: 28
    });
    chats.push({
      id: 'admin-msg',
      type: 'personal',
      name: 'Admin',
      avatar: '⚙️'
    });
  } else if (userRole === 'admin') {
    chats.push({
      id: 'group-class10a',
      type: 'group',
      name: 'Class 10-A',
      avatar: '📚',
      members: 25
    });
    chats.push({
      id: 'group-class10b',
      type: 'group',
      name: 'Class 10-B',
      avatar: '📚',
      members: 28
    });
    chats.push({
      id: 'group-teachers',
      type: 'group',
      name: 'Teachers Group',
      avatar: '👨‍🏫',
      members: 15
    });
  }

  return res.json({ success: true, chats });
});

app.put('/api/auth/admin/reset-password/:id', (req, res) => {
  const v = verifyAdminAuthHeader(req);
  if (!v.ok) return res.status(v.code).json({ success: false, message: v.message });
  // For mock, just return a generated password
  const newPassword = 'newpass' + Math.floor(Math.random() * 9000 + 1000);
  return res.json({ success: true, newPassword });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
