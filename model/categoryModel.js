const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  status: {
    type: String,
    default: 'Active',
  },
  icon: String, 
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
