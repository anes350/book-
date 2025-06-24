import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/users.js';
import * as pdfjsLib from 'pdfjs-dist';
import Book from './models/Book.js';
import SummarizedBook from './models/SummarizedBook.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

const upload = multer({ storage: multer.memoryStorage() });
import axios from 'axios';

import fs from 'fs';

app.post('/summarize-local-pdf', async (req, res) => {
  const { filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: 'مسار الملف مفقود' });

  try {
    
    const fileBuffer = fs.readFileSync('.' + filePath); // يفترض أن filePath يبدأ بـ /uploads
    const uint8Array = new Uint8Array(fileBuffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }

    res.json({ summary: text.slice(0, 4000) });
  } catch (err) {
    console.error('❌ Résumé PDF échoué:', err.message);
    res.status(500).json({ error: 'Erreur lors du résumé du PDF.' });
  }
});

function getDriveDirectDownloadLink(url) {
  // إذا كان الرابط يحتوي /d/ID/
  const regex = /\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  // إذا هو أصلا رابط uc?export=download&id=ID
  if (url.includes('uc?export=download&id=')) return url;
  throw new Error('رابط Google Drive غير مدعوم أو غير صحيح.');
}


async function extractTextFromPDF(buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    fullText += strings.join(' ') + '\n';
  }

  return fullText;
}





app.post('/summarize-pdf', upload.single('pdf'), async (req, res) => {
  try {
    let buffer, fileUrl = '', userId = req.body.userId;

    if (req.file) {
      buffer = req.file.buffer;
      const fileName = req.file.originalname;
      const uploadPath = path.join(__dirname, '../frontend/uploads', fileName);
      fs.writeFileSync(uploadPath, buffer);
      fileUrl = `/uploads/${fileName}`;
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
      const filePath = path.join(__dirname, '../frontend' + fileUrl);
      buffer = fs.readFileSync(filePath);
    } else {
      return res.status(400).json({ error: 'Fichier PDF requis.' });
    }

    const uint8Array = new Uint8Array(buffer);
    const text = await extractTextFromPDF(uint8Array);
    const prompt = `Veuillez résumer ce document PDF :\n\n${text.slice(0, 4000)}`;
    const summary = await generateGeminiResponse(prompt);

    res.json({ summary });

    if (fileUrl && mongoose.Types.ObjectId.isValid(userId)) {
      await SummarizedBook.findOneAndUpdate(
        { fileUrl, userId: new mongoose.Types.ObjectId(userId) },
        { summary, updatedAt: new Date(), title: path.basename(fileUrl), fileUrl },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error('❌ Résumé PDF échoué:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur lors du résumé du PDF.' });
    }
  }
});





app.post('/chat-with-pdf', async (req, res) => {
  const { summary, question } = req.body;
  if (!summary || !question) return res.status(400).json({ error: 'Résumé ou question manquants.' });

  const prompt = `À partir du résumé suivant :\n${summary}\n\nQuestion : ${question}\nRéponse :`;
  const answer = await generateGeminiResponse(prompt);
  res.json({ answer });
});

app.post('/generate-gemini-essay', async (req, res) => {
  const { topic, subheadings, notes, tone, length } = req.body;
  if (!topic || !subheadings || !notes || !tone || !length) {
    return res.status(400).json({ error: "Champs manquants." });
  }

  const prompt = `
    Rédige un essai académique sur : "${topic}".
    Sous-titres : ${subheadings}.
    Notes : ${notes}.
    Ton : ${tone}.
    Longueur : environ ${length} mots.
  `;
  const essay = await generateGeminiResponse(prompt);
  res.json({ essay });
});

app.use('/api/users', userRoutes);
app.post('/upload-book', async (req, res) => {
  const { title, authors, fileUrl, userId, model, category } = req.body;

  if (!title || !authors || !fileUrl || !userId || !model || !category) {
    return res.status(400).json({ error: '🛑 كل الحقول مطلوبة.' });
  }

  try {
    await Book.create({
      title,
      authors,
      fileUrl,
      model,
      category,
      userId,
      createdAt: new Date()
    });

    res.json({ message: '📚 تم إدخال الكتاب بنجاح' });
  } catch (error) {
    console.error('❌ خطأ أثناء إدخال الكتاب:', error);
    res.status(500).json({ error: 'فشل في إضافة الكتاب.' });
  }
});

async function generateGeminiResponse(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBypvwClVcYDmKBOdcSA66pVn4vP3azuMA';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }]
  }, {
    headers: { 'Content-Type': 'application/json' }
  });

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Pas de réponse générée.';
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/archilibrex', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connecté à MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('❌ Erreur MongoDB :', err);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});

app.get('/summarized-books', async (req, res) => {
  const userId = req.query.userId;
  const books = await SummarizedBook.find({ userId }).sort({ createdAt: -1 });
  res.json(books);
});
import fetch from 'node-fetch';


app.get('/books', async (req, res) => {
  try {
    const {
      keyword = '',
      model,
      category,
      yearRange,
      startYear,
      endYear,
      count
    } = req.query;

    const filter = {};

    // فلترة بالكلمة المفتاحية (عنوان أو مؤلف)
    if (keyword && keyword.trim().length > 0 && keyword.trim() !== 'L’impact des jeux de rôle sur le développement des compétences orales en FLE chez les élèves de 5e année primaire en Algérie : étude de cas dans la wilaya de Blida') {
  filter.$or = [
    { title: { $regex: keyword, $options: 'i' } },
    { authors: { $elemMatch: { $regex: keyword, $options: 'i' } } }
  ];
}


    // فلترة النوع
    if (category && category !== 'all') filter.category = category;
    if (model && model !== 'all') filter.model = model;

    // فلترة التاريخ
    if (yearRange === 'custom' && startYear && endYear) {
      filter.createdAt = {
        $gte: new Date(`${startYear}-01-01T00:00:00.000Z`),
        $lte: new Date(`${endYear}-12-31T23:59:59.999Z`)
      };
    } else if (yearRange === '3') {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 3);
      filter.createdAt = { $gte: date };
    } else if (yearRange === '5') {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 5);
      filter.createdAt = { $gte: date };
    }

    // يمكنك طباعة الفلتر للديباغ
    console.log('فلتر البحث:', JSON.stringify(filter, null, 2));

    // استرجاع النتائج من القاعدة
    const books = await Book.find(filter).limit(parseInt(count || 20));
    res.json(books);
  } catch (err) {
    console.error('خطأ في البحث:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء البحث.' });
  }
});


const { getDocument } = pdfjsLib;
import { Readable } from 'stream';

async function extractTextFromPDFUrl(driveUrl) {
  const response = await axios.get(driveUrl, {
    responseType: 'arraybuffer'
  });

  const uint8Array = new Uint8Array(response.data);
  const loadingTask = getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(' ') + '\n';
  }

  return fullText;
}


