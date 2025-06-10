// backend/routes/authors.js

const express = require('express');
const router = express.Router();
const Author = require('../models/Author');
const authenticateToken = require('../middleware/authenticateToken');
const isAdmin = require('../middleware/admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إعداد Multer لتخزين ملفات صور المؤلفين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', process.env.UPLOAD_DIR, 'authors')); // تأكد من تعريف UPLOAD_DIR في ملف .env
  },
  filename: function (req, file, cb) {
    cb(null, 'author-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // الحد الأقصى لحجم الملف 5 ميجابايت
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('يجب أن يكون ملف صورة للمؤلف.'));
    }
    cb(null, true);
  }
});

// إضافة مؤلف جديد
router.post('/add', authenticateToken, isAdmin, upload.single('photo'), async (req, res) => {
  try {
    const { name, bio } = req.body;
    const photoPath = req.file ? req.file.path : '';

    const newAuthor = new Author({
      name,
      bio,
      photo: photoPath
    });

    const savedAuthor = await newAuthor.save();
    res.status(201).json(savedAuthor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// الحصول على جميع المؤلفين
router.get('/', authenticateToken, async (req, res) => {
  try {
    const authors = await Author.find();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// الحصول على مؤلف محدد بواسطة المعرف
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  // التحقق من صحة المعرف
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'معرف المؤلف غير صالح.' });
  }

  try {
    const author = await Author.findById(id);
    if (!author) return res.status(404).json({ message: 'المؤلف غير موجود.' });
    res.json(author);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// تحديث معلومات مؤلف
router.put('/:id', authenticateToken, isAdmin, upload.single('photo'), async (req, res) => {
  const { id } = req.params;

  // التحقق من صحة المعرف
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'معرف المؤلف غير صالح.' });
  }

  try {
    const author = await Author.findById(id);
    if (!author) return res.status(404).json({ message: 'المؤلف غير موجود.' });

    const { name, bio } = req.body;

    if (name) author.name = name;
    if (bio) author.bio = bio;

    if (req.file) {
      // حذف صورة المؤلف القديمة إذا كانت موجودة
      if (author.photo) {
        fs.unlink(author.photo, (err) => {
          if (err) console.error('خطأ في حذف صورة المؤلف القديمة:', err);
        });
      }
      author.photo = req.file.path;
    }

    const updatedAuthor = await author.save();
    res.json(updatedAuthor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// حذف مؤلف
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  // التحقق من صحة المعرف
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'معرف المؤلف غير صالح.' });
  }

  try {
    const author = await Author.findById(id);
    if (!author) {
      return res.status(404).json({ message: 'المؤلف غير موجود.' });
    }

    // حذف المؤلف من قاعدة البيانات
    await Author.findByIdAndDelete(id);

    // حذف صورة المؤلف من النظام
    if (author.photo) {
      fs.unlink(author.photo, (err) => {
        if (err) console.error('خطأ في حذف صورة المؤلف:', err);
      });
    }

    res.json({ message: 'تم حذف المؤلف بنجاح.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
