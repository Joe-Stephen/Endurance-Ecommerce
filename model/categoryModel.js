const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  discount: {
    type: Number,
    default: 0,
  },
  offerStart: Date,
  offerEnd: Date,
  status: {
    type: String,
    default: 'Active',
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
