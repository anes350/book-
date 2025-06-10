const express = require('express');
const router = express.Router();

// مثال: تسجيل مستخدم جديد
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  // ملاحظة: في تطبيق حقيقي، تحقق من البيانات واحفظها في قاعدة البيانات
  res.status(201).json({ message: 'User registered successfully', user: { username, email } });
});

// مثال: تسجيل الدخول
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // ملاحظة: تحقق من البريد وكلمة المرور من قاعدة البيانات
  res.json({ message: 'Login successful', token: 'fake-jwt-token' });
});

module.exports = router;
