const express = require('express');
const router = express.Router();
const { generateEssay } = require('../controllers/essayController');

// المسار الكامل سيكون: /api/essays/generate-gemini-essay
router.post('/generate-gemini-essay', generateEssay);

module.exports = router;
