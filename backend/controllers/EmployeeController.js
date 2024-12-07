const Employee = require('../models/Employee');
const validator = require('validator');
const multer = require('multer');
const path = require('path');



// Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Define where the uploaded files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Create a unique file name with extension
  }
});

// Define file filter (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only JPEG and PNG are allowed'), false);
  }
};

// Initialize Multer
const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 1024 * 1024 * 5 }  // Optional: set file size limit (e.g., 5MB)
});

// Validate employee input
const validateEmployeeInput = (data) => {
    const errors = {};

    // Name validation
    if (validator.isEmpty(data.f_Name)) {
        errors.f_Name = 'Name is required';
    }

    // Email validation
    if (!validator.isEmail(data.f_Email)) {
        errors.f_Email = 'Invalid email format';
    }

    // Mobile number validation
    if (!validator.isMobilePhone(data.f_Mobile, 'any')) {
        errors.f_Mobile = 'Invalid mobile number';
    }

    // Designation validation
    if (validator.isEmpty(data.f_Designation)) {
        errors.f_Designation = 'Designation is required';
    }

    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

const createEmployee = async (req, res) => {
    try {
      console.log('a');
      console.log(req.body);
      
      // Parse f_Course if it's a stringified array
      if (typeof req.body.f_Course === 'string') {
        req.body.f_Course = JSON.parse(req.body.f_Course);
      }
  
      // Ensure f_Name has at least 2 characters
      if (req.body.f_Name && req.body.f_Name.length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters' });
      }
  
      // Check if f_Image is valid (jpg/png)
      if (req.body.f_Image && !req.body.f_Image.match(/\.(jpg|png)$/)) {
        return res.status(400).json({ message: 'Image must be jpg or png' });
      }
  
      // Check for duplicate email
      const { errors, isValid } = validateEmployeeInput(req.body);
  
      if (!isValid) {
        return res.status(400).json(errors);
      }
  
      console.log('b');
  
      const existingEmployee = await Employee.findOne({ f_Email: req.body.f_Email });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      // Create new employee with validated data
      const newEmployee = new Employee({
        f_Name: req.body.f_Name,
        f_Email: req.body.f_Email,
        f_Mobile: req.body.f_Mobile,
        f_Designation: req.body.f_Designation,
        f_gender: req.body.f_gender,
        f_Course: req.body.f_Course,  
        f_Id: req.body.f_Id,         
        f_Image: req.body.f_Image   
      });
  
      await newEmployee.save();
  
      res.status(201).json({ 
        message: 'Employee created successfully', 
        employee: newEmployee 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

// Get all Employees
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Employee by ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const { errors, isValid } = validateEmployeeInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        // Create a new object with the updated fields
        const updatedEmployeeData = {
            f_Name: req.body.f_Name,
            f_Email: req.body.f_Email,
            f_Mobile: req.body.f_Mobile,
            f_Designation: req.body.f_Designation,
            f_gender: req.body.f_gender,
            f_Course: req.body.f_Course,
            f_Id: req.body.f_Id,
            f_Image: req.body.f_Image
        };

        console.log(updatedEmployeeData)

        // If f_Course is a stringified array, parse it
        if (typeof updatedEmployeeData.f_Course === 'string') {
            updatedEmployeeData.f_Course = JSON.parse(updatedEmployeeData.f_Course);
        }

        // Check if f_Name has at least 2 characters
        if (updatedEmployeeData.f_Name && updatedEmployeeData.f_Name.length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters' });
        }

        // Check if f_Image is valid (jpg/png)
        if (updatedEmployeeData.f_Image && !updatedEmployeeData.f_Image.match(/\.(jpg|png)$/)) {
            return res.status(400).json({ message: 'Image must be jpg or png' });
        }

        // Use f_Id for querying the employee
        const employee = await Employee.findOneAndUpdate(
            { f_Id: req.params.id }, // Match based on f_Id in the database
            updatedEmployeeData
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({
            message: 'Employee updated successfully',
            employee
        });
    } catch (error) {
        console.log(req.body)
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Delete Employee
const deleteEmployee = async (req, res) => {
    try {
        const empId = req.params.id; // Get f_Id from the URL parameters
        console.log(empId);

        // Find and delete the employee by f_Id
        const employee = await Employee.findOneAndDelete({ f_Id: empId });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};
