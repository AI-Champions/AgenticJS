/**
 * OpenResponses adapter server: exposes a KaibanJS Team at POST /v1/responses for OpenClaw.
 */
import 'dotenv/config';
import express from 'express';
import { handleOpenResponses } from './adapter.js';

const PORT = Number(process.env.PORT) || 3100;
const SECRET = process.env.KAIBAN_OPENRESPONSES_SECRET ?? '';

const app = express();

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'kaiban-openresponses-adapter' });
});

function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (!SECRET) {
    next();
    return;
  }
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        message: 'Missing or invalid Authorization header',
        type: 'authentication_error',
      },
    });
    return;
  }
  const token = auth.slice(7).trim();
  if (token !== SECRET) {
    res.status(401).json({
      error: { message: 'Invalid token', type: 'authentication_error' },
    });
    return;
  }
  next();
}

app.post('/v1/responses', authMiddleware, (req, res) => {
  void handleOpenResponses(req, res);
});

app.listen(PORT, () => {
  console.log(`
  KaibanJS OpenResponses Adapter
  ------------------------------
  Health:     http://localhost:${PORT}/health
  Responses:  POST http://localhost:${PORT}/v1/responses
  Auth:       Bearer token (set KAIBAN_OPENRESPONSES_SECRET)
  ------------------------------
  `);
});
