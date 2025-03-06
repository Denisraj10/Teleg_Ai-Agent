const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const { OpenAI } = require('openai');

const app = express();
const token = process.env.TELEGRAM_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY; 
const botName = 'DenisAIBot';


const bot = new TelegramBot(token);
const openai = new OpenAI({ apiKey: openaiApiKey });


app.use(express.json());


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text === '/start') {
    bot.sendMessage(chatId, `Hello! I’m ${botName}, your AI assistant powered by advanced language technology. How can I assist you today?`);
    return;
  }

  const prompt = `
    You are ${botName}, an intelligent and friendly AI agent created by Denis. 
    You’re designed to assist users with natural, human-like conversations, answering questions, providing insights, and helping with tasks. 
    Respond to this message in a conversational tone: "${text}"
  `;

  try {
 
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', 
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200, 
      temperature: 0.7, 
    });

    const reply = response.choices[0].message.content.trim();
    bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error('OpenAI error:', error);
    bot.sendMessage(chatId, 'Oops! Something went wrong on my end. Could you try again?');
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