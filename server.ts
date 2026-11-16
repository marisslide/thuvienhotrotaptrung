import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'thu-vien-hoat-dong-tai-tap-trung',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/library-info', (_req, res) => {
  res.json({
    name: 'Thư viện hoạt động hỗ trợ tái tập trung',
    slogan: 'Nhận diện biểu hiện – Lựa chọn hoạt động – Quay lại nhiệm vụ học tập',
    audience: 'Giáo viên THCS',
    groupsCount: 6,
    expressionsCount: 6,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
