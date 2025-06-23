import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: String,
  authors: [String],
  fileUrl: String,
  model: String,       // ⬅️ معيار نوع البحث (standard, recherche…)
  category: String,    // ⬅️ معيار الفئة (sciences, littérature…)
  userId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Book', bookSchema);
