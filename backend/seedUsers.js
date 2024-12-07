require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Login } = require('./models/Login'); // Adjust path if needed

// MongoDB Connection URI from .env
const MONGO_URI = process.env.MONGO_URI;

// Default users to add
const defaultUsers = [
  { f_sno: 1, f_userName: 'admin', f_Pwd: 'pass123' },
  { f_sno: 2, f_userName: 'user', f_Pwd: 'pass123' }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Encrypt passwords and seed default users into the database
const seedUsers = async () => {
  try {
    for (const user of defaultUsers) {
      const existingUser = await Login.findOne({ f_userName: user.f_userName });
      if (!existingUser) {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.f_Pwd, salt);

        // Create user with hashed password
        await Login.create({ ...user, f_Pwd: hashedPassword });
        console.log(`User ${user.f_userName} added successfully.`);
      } else {
        console.log(`User ${user.f_userName} already exists.`);
      }
    }
  } catch (error) {
    console.error('Error seeding users:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Main function to run the script
const main = async () => {
  if (!MONGO_URI) {
    console.error('Error: MONGO_URI is not defined in the .env file');
    process.exit(1);
  }
  await connectDB();
  await seedUsers();
};

main();
