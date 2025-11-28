import User from '../models/User.js';
import Task from '../models/Task.js';
import Result from '../models/Result.js';
import Fee from '../models/Fee.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Admin Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'admin', isActive: true });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create Teacher
export const createTeacher = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      subject, 
      qualifications, 
      experience, 
      phone, 
      address 
    } = req.body;

    // Check if teacher already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Teacher already exists with this email'
      });
    }

    // Generate default password if not provided
    const userPassword = password || generateDefaultPassword();

    const teacher = await User.create({
      name,
      email,
      password: userPassword,
      role: 'teacher',
      subject,
      qualifications: qualifications || [],
      experience: experience || 0,
      phone,
      address,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        password: userPassword // Send password back for admin to share
      }
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create Student
export const createStudent = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      class: studentClass, 
      rollNo, 
      parentName, 
      parentPhone, 
      phone, 
      address 
    } = req.body;

    // Check if student already exists with same email or roll number
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { rollNo, class: studentClass }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Student already exists with this email or roll number'
      });
    }

    // Generate default password if not provided
    const userPassword = password || generateDefaultPassword();

    const student = await User.create({
      name,
      email,
      password: userPassword,
      role: 'student',
      class: studentClass,
      rollNo,
      parentName,
      parentPhone,
      phone,
      address,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        class: student.class,
        rollNo: student.rollNo,
        password: userPassword // Send password back for admin to share
      }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all teachers
export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('-password')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teachers.length,
      teachers
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all students
export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('createdBy', 'name')
      .sort({ class: 1, rollNo: 1 });

    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword || generateDefaultPassword();
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully',
      newPassword: user.password
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const totalFees = await Fee.countDocuments();

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        pendingTasks,
        totalFees
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to generate default password
const generateDefaultPassword = () => {
  return Math.random().toString(36).slice(-8) + '123'; // 8 character random + 123
};