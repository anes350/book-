const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
require('dotenv').config();

dotenv.config();

if (!process.env.MONGO_URI || !process.env.UPLOAD_DIR) {
  console.error('❌ يرجى التأكد من تعريف جميع المتغيرات في ملف .env');
  process.exit(1);
}

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
const bookRoutes = require('./routes/books');
const authorRoutes = require('./routes/authors');
const userRoutes = require('./routes/users');

app.use('/books', bookRoutes);
app.use('/authors', authorRoutes);
app.use('/users', userRoutes);
