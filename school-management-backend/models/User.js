const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false
  },
  role: {
    type: String,
    required: [true, "Role is required"],
    enum: {
      values: ["admin", "teacher", "student"],
      message: "Role must be admin, teacher, or student"
    }
  },
  phone: {
    type: String,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
  },
  address: {
    type: String,
    maxlength: [200, "Address cannot exceed 200 characters"]
  },
  dateOfBirth: Date,
  profilePicture: String,
  
  // Teacher specific
  subject: {
    type: String,
    required: function() { return this.role === "teacher"; }
  },
  qualifications: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Student specific
  class: {
    type: String,
    required: function() { return this.role === "student"; },
    enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
  },
  rollNo: {
    type: String,
    required: function() { return this.role === "student"; }
  },
  parentName: {
    type: String,
    trim: true
  },
  parentPhone: {
    type: String,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

// Password hashing
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);