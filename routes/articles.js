// routes/articles.js
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// إنشاء مقال جديد
router.post('/', async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// جلب كل المقالات
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().populate('author', 'username');
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// جلب مقال واحد حسب المعرف
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('author', 'username');
    if (!article) return res.status(404).json({ error: 'المقال غير موجود' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
router.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'الطلب فارغ أو غير صحيح' });
  }

  try {
    // مثال: استدعاء API خارجي أو ذكاء صناعي داخلي (محلي مثلاً أو OpenAI)
    const generatedContent = `هذه مقالة تم توليدها آلياً بناءً على: ${prompt}`;

    const newArticle = new Article({
      title: prompt,
      content: generatedContent,
      author: req.user?._id || null // حسب وجود التحقق
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(500).json({ error: 'فشل في توليد المقال' });
  }
});
require('dotenv').config();
const apiKey = process.env.OPENAI_API_KEY;
