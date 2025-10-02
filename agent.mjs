import 'dotenv/config';
import fs from 'fs/promises';
import fg from 'fast-glob';

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL;

if (!API_KEY || !MODEL) {
  console.error('Brakuje API_KEY lub MODEL w .env');
  process.exit(1);
}

// 🔍 1. Znajdź pliki kodu
async function getCodeFiles() {
  const entries = await fg(['**/*.{js,ts,jsx,tsx,mjs}'], {
    ignore: ['node_modules', 'dist', 'build'],
    dot: true
  });

  return entries;
}

// 📖 2. Wczytaj zawartość plików
async function readFiles(files) {
  const contents = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(file, 'utf-8');
      return `// FILE: ${file}\n${content}\n`;
    })
  );
  return contents.join('\n');
}

// 🤖 3. Wywołanie LLM z kontekstem kodu
async function callLLM(codeContext, userMessage) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost',
      'X-Title': 'RafLab Mini Agent'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `Jesteś pomocnym asystentem. Poniżej masz fragmenty kodu źródłowego:\n\n${codeContext}`
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.3
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? '(brak odpowiedzi)';
}

// 🟢 4. Start
const question = process.argv.slice(2).join(' ').trim() || 'Co robi ten kod?';

try {
  const files = await getCodeFiles();
  if (files.length === 0) {
    console.warn('Nie znaleziono plików kodu w repo.');
    process.exit(1);
  }

  const code = await readFiles(files);
  const answer = await callLLM(code, question);
  console.log('\n=== Odpowiedź modelu ===\n');
  console.log(answer);
  console.log('\n========================\n');
} catch (err) {
  console.error('\nBłąd agenta:\n', err.message);
  process.exit(1);
}