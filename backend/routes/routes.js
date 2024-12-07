const express = require('express');
const { loginUser, registerUser } = require('../controllers/LoginController');
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/EmployeeController');
const multer = require('multer'); // Import multer
const upload = multer({ dest: 'uploads/' }); // Create a multer instance with the destination

const router = express.Router();

// Login routes
router.post('/api/login', loginUser);
router.post('/api/register', registerUser);

// Employee routes
// Use upload.single('f_Image') middleware here to handle file upload for 'f_Image'
router.post('/api/employees', upload.single('f_Image'), createEmployee);
router.get('/api/employees', getAllEmployees);
router.get('/api/employees/:id', getEmployeeById);
router.put('/api/employees/:id', updateEmployee);
router.delete('/api/employees/:id', deleteEmployee);

module.exports = router;
