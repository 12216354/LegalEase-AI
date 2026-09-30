import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/apiRouter.ts';
import { CONFIG } from './server/config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable JSON body parsing
app.use(express.json({ limit: '10mb' }));

// CORS configuration for flexibility across deployment domains
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mount the EduGenie API routes
app.use(apiRouter);

// Serve production static assets if dist exists
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// For all non-API GET requests, serve index.html (client-side routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/qa' || req.path === '/quiz' || req.path === '/explain' || req.path === '/summarize') {
    return next();
  }
  res.sendFile(path.resolve(distPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

const PORT = CONFIG.port || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 EduGenie server running on http://0.0.0.0:${PORT}`);
  console.log(`🤖 Powered by Google Gemini model: ${CONFIG.geminiModel}`);
});

export default app;
