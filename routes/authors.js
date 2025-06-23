import express from 'express';
import Author from '../models/Author.js';
import authenticateToken from '../middleware/authenticateToken.js';
import isAdmin from '../middleware/admin.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

const router = express.Router();

// إعداد Multer لتخزين ملفات صور المؤلفين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), process.env.UPLOAD_DIR, 'authors'));
  },
  filename: function (req, file, cb) {
    cb(null, 'author-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('يجب أن يكون ملف صورة للمؤلف.'));
    }
    cb(null, true);
  }
});

// باقي الأكواد كما هي...

export default router;
