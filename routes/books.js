const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Book = require('../models/Book');
const Author = require('../models/Author');
const authenticateToken = require('../middleware/authenticateToken');
const isAdmin = require('../middleware/admin');
const mongoose = require('mongoose');
const fs = require('fs');

// إعداد Multer لتخزين ملفات صور غلاف الكتب وروابط التنزيل
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تحديد مجلد التخزين بناءً على نوع الملف
    if (file.fieldname === 'coverImage') {
      cb(null, process.env.UPLOAD_COVER_DIR); // تأكد من تعريف UPLOAD_COVER_DIR في ملف .env
    } else if (file.fieldname === 'downloadLink') {
      cb(null, process.env.UPLOAD_DOWNLOAD_DIR); // تأكد من تعريف UPLOAD_DOWNLOAD_DIR في ملف .env
    }
  },
  filename: function (req, file, cb) {
    cb(null, 'book-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // الحد الأقصى لحجم الملف 10 ميجابايت
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'coverImage') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('يجب أن يكون ملف صورة لغلاف الكتاب.'));
      }
    } else if (file.fieldname === 'downloadLink') {
      if (!file.mimetype === 'application/pdf') {
        return cb(new Error('يجب أن يكون ملف PDF لتنزيل الكتاب.'));
      }
    }
    cb(null, true);
  }
});

// إضافة كتاب جديد
router.post('/add', authenticateToken, isAdmin, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'downloadLink', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, author, category, description } = req.body;
    const coverImagePath = req.files['coverImage'] ? req.files['coverImage'][0].path : '';
    const downloadLinkPath = req.files['downloadLink'] ? req.files['downloadLink'][0].path : '';

    // التحقق من وجود المؤلف
    const existingAuthor = await Author.findById(author);
    if (!existingAuthor) {
      return res.status(400).json({ message: 'المؤلف غير موجود.' });
    }

    const newBook = new Book({
      title,
      author,
      category,
      description,
      coverImage: coverImagePath,
      downloadLink: downloadLinkPath
    });

    const savedBook = await newBook.save();

    // إضافة الكتاب إلى قائمة الكتب الخاصة بالمؤلف
    existingAuthor.books.push(savedBook._id);
    await existingAuthor.save();

    res.status(201).json(savedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// الحصول على جميع الكتب
router.get('/', authenticateToken, async (req, res) => {
  try {
    const books = await Book.find().populate('author');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// الحصول على كتاب محدد بواسطة المعرف
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  // التحقق من صحة المعرف
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'معرف الكتاب غير صالح.' });
  }

  try {
    const book = await Book.findById(id).populate('author');
    if (!book) return res.status(404).json({ message: 'الكتاب غير موجود.' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// تحديث معلومات كتاب
router.put('/:id', authenticateToken, isAdmin, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'downloadLink', maxCount: 1 }]), async (req, res) => {
  const { id } = req.params;

  // التحقق من صحة المعرف
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'معرف الكتاب غير صالح.' });
  }

  try {
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'الكتاب غير موجود.' });

    const { title, author, category, description } = req.body;

    if (title) book.title = title;
    if (author) {
      // التحقق من وجود المؤلف الجديد
      const existingAuthor = await Author.findById(author);
      if (!existingAuthor) {
        return res.status(400).json({ message: 'المؤلف الجديد غير موجود.' });
      }

      // إزالة الكتاب من قائمة الكتب الخاصة بالمؤلف القديم
      const oldAuthor = await Author.findById(book.author);
      if (oldAuthor) {
        oldAuthor.books.pull(book._id);
        await oldAuthor.save();
      }

      // إضافة الكتاب إلى قائمة الكتب الخاصة بالمؤلف الجديد
      existingAuthor.books.push(book._id);
      await existingAuthor.save();

      book.author = author;
    }
    if (category) book.category = category;
    if (description) book.description = description;

    if (req.files['coverImage']) {
      // حذف صورة الغلاف القديمة إذا كانت موجودة
      if (book.coverImage) {
        fs.unlink(book.coverImage, (err) => {
          if (err) console.error('خطأ في حذف صورة الغلاف القديمة:', err);
        });
      }
      book.coverImage = req.files['coverImage'][0].path;
    }

    if (req.files['downloadLink']) {
      // حذف رابط التنزيل القديم إذا كان موجودًا
      if (book.downloadLink) {
        fs.unlink(book.downloadLink, (err) => {
          if (err) console.error('خطأ في حذف رابط التنزيل القديم:', err);
        });
      }
      book.downloadLink = req.files['downloadLink'][0].path;
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// حذف كتاب
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  // التحقق من صحة المعرف
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'معرف الكتاب غير صالح.' });
  }

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'الكتاب غير موجود.' });
    }

    // حذف الكتاب من قاعدة البيانات
    await Book.findByIdAndDelete(id);

    // إزالة الكتاب من قائمة الكتب الخاصة بالمؤلف
    const author = await Author.findById(book.author);
    if (author) {
      author.books.pull(book._id);
      await author.save();
    }

    // حذف ملفات الصور ورابط التنزيل من النظام
    if (book.coverImage) {
      fs.unlink(book.coverImage, (err) => {
        if (err) console.error('خطأ في حذف صورة الغلاف:', err);
      });
    }
    if (book.downloadLink) {
      fs.unlink(book.downloadLink, (err) => {
        if (err) console.error('خطأ في حذف رابط التنزيل:', err);
      });
    }

    res.json({ message: 'تم حذف الكتاب بنجاح.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
