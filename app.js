import express from 'express';

const app = express();

app.use(express.json());

app.post('/generate-gemini-essay', (req, res) => {
  const data = req.body;
  console.log(data);

  // تحقق من وجود الحقول المطلوبة وأنها ليست فارغة
  const requiredFields = ['topic', 'length'];
  for (const field of requiredFields) {
    if (!data[field] || String(data[field]).trim() === '') {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  // هنا ضع منطق الذكاء الاصطناعي أو توليد المقال
  res.json({ output: 'تم توليد المقال بنجاح.' });
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});