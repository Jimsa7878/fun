# ITC Hitster Bingo

En responsiv React/Vite-version av Hitster Bingo. Appen fungerar i moderna webbläsare på dator, iPhone, iPad och Android och kan publiceras som statiska filer på GitHub Pages.

## Kör lokalt

```bash
npm install
npm run dev
```

## Bygg för GitHub Pages

```bash
npm run build
```

Publicera innehållet i `dist` med GitHub Pages. `vite.config.js` använder relativ sökväg (`base: './'`), så projektet fungerar även i en repository-sökväg.
