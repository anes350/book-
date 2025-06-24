import mongoose from 'mongoose';

const summarizedBookSchema = new mongoose.Schema({
  title: String,
  summary: String,
  fileUrl: String,  // إضافة الحقل بشكل صحيح
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: Date
});

const SummarizedBook = mongoose.model("SummarizedBook", summarizedBookSchema);
export default SummarizedBook;
