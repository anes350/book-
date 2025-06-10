import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: String,
  authors: [String],
  date: String,
  filePath: String,
  summary: String,
  createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
