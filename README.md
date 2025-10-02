#  Mini Agent – RafLab AI

Prosty lokalny agent AI, który czyta Twoje pliki kodu i odpowiada na pytania dzięki modelom LLM (np. przez OpenRouter).  
Działa w terminalu, bez przeglądarki – szybki i skuteczny.

---

##  Funkcje

-  **Czyta kod z repozytorium** (`.js`, `.ts`, `.jsx`, `.tsx`, `.mjs`)
-  **Przeszukuje pliki i tworzy kontekst do zadania**
-  **Wysyła pytanie do modelu AI (LLM) przez OpenRouter**
-  **Zwraca odpowiedź: komentarze, poprawki, sugestie, kod**
-  (opcjonalnie) wspiera analizę pliku testowego

---

##  Szybki start

1. Sklonuj repo:
   ```bash
   git clone https://github.com/rafaraf75/mini-agent.git
   cd mini-agent
2. Zainstaluj zależności
   ```bash
   npm install
3. Utwórz i skonfiguruj .env
   OPENROUTER_API_KEY=sk-...
   MODEL=openai/gpt-3.5-turbo
4. ```bash
   npm run agent -- "Co robi ten kod?"

##  Przykład działania

```bash
$ npm run agent --"Znajdź błędy i zaproponuj poprawki"

=== Odpowiedź modelu ===

Brak błędów, ale można uprościć kod...


 
