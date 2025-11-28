const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/school_management", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.log("❌ MongoDB Connection Error:", err));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ UPDATED CORS Configuration - All origins allow karen
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    // In production, restrict to specific domains
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://127.0.0.1:5173', 
      'http://localhost:3000',
      'http://192.168.56.1:3000',
      'http://localhost:5000',
    ];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"]
}));

// ✅ Handle preflight requests
app.options('*', cors());

// Security middleware
app.use(helmet());

// Apply rate limiting
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/admin", adminRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎯 School Management Server is running!",
    timestamp: new Date().toISOString(),
    cors: "Enabled for all origins in development",
    endpoints: {
      auth: {
        login: "POST /api/auth/login",
        adminLogin: "POST /api/auth/admin/login", 
        teacherLogin: "POST /api/auth/teacher/login",
        studentLogin: "POST /api/auth/student/login"
      }
    }
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy! 🟢",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    cors: "Enabled",
    timestamp: new Date().toISOString()
  });
});

// Test route for creating initial admin
app.post("/api/test/create-admin", async (req, res) => {
  try {
    const User = require("./models/User");
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.json({
        success: true,
        message: "Admin already exists",
        admin: {
          email: existingAdmin.email,
          password: "Use existing password"
        }
      });
    }

    // Create admin
    const admin = new User({
      name: "Super Admin",
      email: "admin@school.com",
      password: "admin123",
      role: "admin",
      phone: "1234567890"
    });

    await admin.save();

    res.json({
      success: true,
      message: "Admin created successfully!",
      admin: {
        email: "admin@school.com",
        password: "admin123"
      }
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating admin"
    });
  }
});

// Test route for creating sample users
app.post("/api/test/create-sample-users", async (req, res) => {
  try {
    const User = require("./models/User");
    
    // Sample teacher
    const teacher = new User({
      name: "John Teacher",
      email: "teacher@school.com",
      password: "teacher123",
      role: "teacher",
      subject: "Mathematics",
      qualifications: ["M.Sc Mathematics", "B.Ed"],
      experience: 5,
      phone: "9876543210"
    });

    // Sample student
    const student = new User({
      name: "Alice Student", 
      email: "student@school.com",
      password: "student123",
      role: "student",
      class: "10",
      rollNo: "25",
      parentName: "Mr. Student",
      parentPhone: "9876543211",
      phone: "9876543212"
    });

    await teacher.save();
    await student.save();

    res.json({
      success: true,
      message: "Sample users created successfully!",
      users: {
        teacher: {
          email: "teacher@school.com",
          password: "teacher123"
        },
        student: {
          email: "student@school.com", 
          password: "student123"
        }
      }
    });
  } catch (error) {
    console.error("Create sample users error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating sample users"
    });
  }
});

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "🔍 Route not found",
    requestedUrl: req.originalUrl
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("🚨 Server Error:", err.stack);
  
  // CORS error handling
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: "CORS Error: Origin not allowed"
    });
  }
  
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ MongoDB: ${mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"}`);
  console.log(`✅ CORS: Enabled for all origins in development`);
  console.log(`\n🔧 Setup Routes:`);
  console.log(`   Create Admin: POST http://localhost:${PORT}/api/test/create-admin`);
  console.log(`   Create Sample Users: POST http://localhost:${PORT}/api/test/create-sample-users`);
  console.log(`\n👥 Test Credentials (after setup):`);
  console.log(`   Admin: admin@school.com / admin123`);
  console.log(`   Teacher: teacher@school.com / teacher123`);
  console.log(`   Student: student@school.com / student123`);
});