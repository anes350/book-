const express = require('express');
const router = express.Router();
const { askGemini } = require('../services/gemini');

router.post('/ask', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const result = await askGemini(prompt);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'AI generation failed' });
  }
});

module.exports = router;
