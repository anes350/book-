import mongoose from 'mongoose';

const AuthorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  photo: String,
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }]
});

const Author = mongoose.model('Author', AuthorSchema);

export default Author;
