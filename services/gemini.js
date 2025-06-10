const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function askGemini(prompt) {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('❌ خطأ في طلب Gemini API:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { askGemini };
