const mongoose = require('mongoose');

const LoginSchema = new mongoose.Schema({
  f_sno: {
    type: Number,
    required: true,
    unique: true
  },
  f_userName: {
    type: String,
    required: true,
    unique: true
  },
  f_Pwd: {
    type: String,
    required: true
  }
});

module.exports = {
    Login: mongoose.model("Login", LoginSchema)
}