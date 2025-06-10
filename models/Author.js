const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  photo: { type: String }, // مسار صورة المؤلف
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});

module.exports = mongoose.model('Author', authorSchema);
