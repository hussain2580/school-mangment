const express = require("express");
const { auth, authorize } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Create teacher
router.post("/create-teacher", auth, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, subject, qualifications, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Teacher already exists with this email"
      });
    }

    const teacher = await User.create({
      name,
      email,
      password: password || "teacher123",
      role: "teacher",
      subject,
      qualifications: qualifications || [],
      phone,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        password: password || "teacher123"
      }
    });
  } catch (error) {
    console.error("Create teacher error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Create student
router.post("/create-student", auth, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, class: studentClass, rollNo, parentName, parentPhone, phone } = req.body;

    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { rollNo, class: studentClass }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Student already exists with this email or roll number"
      });
    }

    const student = await User.create({
      name,
      email,
      password: password || "student123",
      role: "student",
      class: studentClass,
      rollNo,
      parentName,
      parentPhone,
      phone,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        class: student.class,
        rollNo: student.rollNo,
        password: password || "student123"
      }
    });
  } catch (error) {
    console.error("Create student error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get all teachers
router.get("/teachers", auth, authorize("admin"), async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teachers.length,
      teachers
    });
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get all students
router.get("/students", auth, authorize("admin"), async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ class: 1, rollNo: 1 });

    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;