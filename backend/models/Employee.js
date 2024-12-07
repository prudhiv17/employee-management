const mongoose = require('mongoose');
const validator = require('validator');

const EmployeeSchema = new mongoose.Schema({
  f_Id: {
    type: String,
    required: [true, 'Unique ID is required'],
    unique: true,
    trim: true
  },
  f_Image: {
    type: String,
    validate: {
      validator: function(v) {
        // Validate image file extension
        return /\.(jpg|jpeg|png)$/i.test(v);
      },
      message: 'Image must be jpg or png'
    }
  },
  f_Name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  f_Email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email format'
    }
  },
  f_Mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function(v) {
        // Basic phone number validation
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Mobile number must be 10 digits'
    }
  },
  f_Designation: {
    type: String,
    enum: {
      values: ['HR', 'Manager', 'Sales'],
      message: 'Invalid designation'
    },
    required: [true, 'Designation is required']
  },
  f_gender: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Invalid gender selection'
    },
    required: [true, 'Gender is required']
  },
  f_Course: [{
    type: String,
    enum: {
      values: ['MCA', 'BCA', 'BSC'],
      message: 'Invalid course selection'
    }
  }],
  f_Createdate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound unique index to prevent duplicates
EmployeeSchema.index({ f_Email: 1 }, { unique: true });

// Pre-save hook for additional validations
EmployeeSchema.pre('save', function(next) {
  // Validate courses
  if (this.f_Course && this.f_Course.length === 0) {
    return next(new Error('At least one course must be selected'));
  }

  // Additional custom validations can be added here
  next();
});

// Virtual for full details
EmployeeSchema.virtual('fullDetails').get(function() {
  return `${this.f_Name} - ${this.f_Email}`;
});

module.exports = mongoose.model('Employee', EmployeeSchema);