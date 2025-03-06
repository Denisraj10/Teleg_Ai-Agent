const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const token = process.env.TELEGRAM_TOKEN; 
const geminiApiKey = process.env.GEMINI_API_KEY;
const botName = 'DenisAIBot';


const bot = new TelegramBot(token);
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); 

// Middleware for webhook
app.use(express.json());


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text === '/start') {
    bot.sendMessage(chatId, `Hello! I’m ${botName}, your AI assistant powered by Gemini. How can I help you today?`);
    return;
  }

  try {
    const result = await model.generateContent(`You are ${botName}, a friendly AI created by Denis. Respond to: "${text}"`);
    const reply = result.response.text().trim();
    bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error('Gemini API error:', error.message);
    bot.sendMessage(chatId, 'Oops! Something went wrong. Try again!');
  }
});


app.post('/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  const renderUrl = process.env.RENDER_EXTERNAL_URL || `https://denis-ai-bot.onrender.com`;
  await bot.setWebHook(`${renderUrl}/webhook`);
});