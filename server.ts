import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory / persisted state cache for Hostinger fast response
let serverState: any = null;

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    app: 'Malak Al-Sfiha Zakaria Aroub POS & Storefront',
    timestamp: new Date().toISOString(),
    hostingerReady: true
  });
});

// API Get Data
app.get('/api/data', (_req, res) => {
  res.json({ success: true, data: serverState });
});

// API Save Data
app.post('/api/data', (req, res) => {
  serverState = req.body;
  res.json({ success: true, message: 'State synced successfully' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev: mount Vite middlewares
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    // In production (Hostinger deployment)
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
