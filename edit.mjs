import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.MODEL;

if (!API_KEY || !MODEL) {
  console.error(' Brakuje API_KEY lub MODEL w .env');
  process.exit(1);
}

const filesToEdit = await fg(['**/*.js'], {
  ignore: ['node_modules', 'dist', 'build'],
  dot: true,
});

if (!filesToEdit.length) {
  console.warn(' Nie znaleziono plików JS do edycji.');
  process.exit(0);
}

const question = process.argv.slice(2).join(' ').trim();

if (!question) {
  console.error(' Podaj instrukcję np. "Dodaj komentarze JSDoc do każdej funkcji".');
  process.exit(1);
}

for (const file of filesToEdit) {
  console.log(`\n Przetwarzanie pliku: ${file}`);

  const originalCode = await fs.readFile(file, 'utf-8');

  const systemPrompt = `
Masz zmodyfikować kod pliku tak, aby spełniał poniższą instrukcję użytkownika.
Zwróć **pełny zmodyfikowany plik**, w tym oryginalne importy, nagłówki i kod.
Nie tłumacz, nie wyjaśniaj – zwróć tylko kod, gotowy do zapisania.

Plik: ${file}
`;

  const userPrompt = `${question}

Oryginalny kod pliku:
${originalCode}
`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2
    })
  });

  const result = await response.json();

  const newCode = result?.choices?.[0]?.message?.content;

  if (!newCode) {
    console.error(' Nie udało się uzyskać odpowiedzi od modelu.');
    continue;
  }

  if (!newCode.includes('function') && !newCode.includes('import')) {
    console.warn(' Odpowiedź nie wygląda jak kod JS. Pomijam zapis.');
    continue;
  }

  //  Zapisz zmodyfikowany kod do pliku
  await fs.writeFile(file, newCode.trim(), 'utf-8');
  console.log(` Nadpisano plik: ${file}`);
}

console.log('\n🎉 Gotowe! Agent zakończył edytowanie plików.\n');
