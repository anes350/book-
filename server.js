import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/users.js';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
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

app.get('/books', async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json(books);
});

app.post('/summarize-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const text = await extractTextFromPDF(req.file.buffer);
    const prompt = `Veuillez résumer ce document PDF :\n\n${text.slice(0, 4000)}`;
    const summary = await generateGeminiResponse(prompt);

    await SummarizedBook.create({
      title: req.file.originalname,
      summary,
      userId: req.body.userId,
      createdAt: new Date()
    });

    res.json({ summary });
  } catch (err) {
    console.error('❌ Résumé PDF échoué:', err);
    res.status(500).json({ error: 'Erreur lors du résumé du PDF.' });
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

async function generateGeminiResponse(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAVgVQ0VeZ6bG-rSa48grE18f-5tVTjvpE';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
