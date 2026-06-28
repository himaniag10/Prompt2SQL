const fs = require('fs');
const env = fs.readFileSync('backend/.env', 'utf8');
const groqKey = env.match(/GROQ_API_KEY=(.*)/)[1].trim();
const geminiKey = env.match(/GEMINI_API_KEY=(.*)/)[1].trim();

async function getGroqModels() {
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${groqKey}` }
  });
  const data = await res.json();
  console.log('Groq models:', data.data?.map(m => m.id).join(', '));
}

async function getGeminiModels() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
  const data = await res.json();
  console.log('Gemini models:', data.models?.map(m => m.name).join(', '));
}

getGroqModels();
getGeminiModels();
