import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

if (!process.env.MONGO_URI || !process.env.UPLOAD_DIR) {
  console.error('❌ يرجى التأكد من تعريف جميع المتغيرات في ملف .env');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());

// تحميل الملفات الثابتة
app.use('/uploads/authors', express.static(path.join(__dirname, process.env.UPLOAD_DIR, 'authors')));
app.use('/uploads/books', express.static(path.join(__dirname, process.env.UPLOAD_DIR, 'books')));

// الاتصال بقاعدة البيانات
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  })
  .catch((err) => {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', err.message);
    process.exit(1);
  });

// المسارات
import bookRoutes from './routes/books.js';
import authorRoutes from './routes/authors.js';
import userRoutes from './routes/users.js';

app.use('/books', bookRoutes);
app.use('/authors', authorRoutes);
app.use('/users', userRoutes);
