import express from 'express';
import multer from 'multer';
import path from 'path';
import Book from '../models/Book.js';
import Author from '../models/Author.js';
import authenticateToken from '../middleware/authenticateToken.js';
import isAdmin from '../middleware/admin.js';
import mongoose from 'mongoose';
import fs from 'fs';

const router = express.Router();

// إعداد Multer لتخزين ملفات صور غلاف الكتب وروابط التنزيل
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'coverImage') {
      cb(null, process.env.UPLOAD_COVER_DIR);
    } else if (file.fieldname === 'downloadLink') {
      cb(null, process.env.UPLOAD_DOWNLOAD_DIR);
    }
  },
  filename: function (req, file, cb) {
    cb(null, 'book-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'coverImage') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('يجب أن يكون ملف صورة لغلاف الكتاب.'));
      }
    } else if (file.fieldname === 'downloadLink') {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('يجب أن يكون ملف PDF لتنزيل الكتاب.'));
      }
    }
    cb(null, true);
  }
});

// جميع المسارات كما هي (لم أغير المنطق الداخلي)

// في نهاية الملف:
export default router;
