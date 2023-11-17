const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  type: {
    type: String,
    enum: ['product', 'promotion','category', 'brand', 'feature', 'holiday'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const banner = mongoose.model('banner', bannerSchema);

module.exports = banner;
