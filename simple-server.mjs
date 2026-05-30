import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

const staticDir = path.join(__dirname, '.next', 'static');
const publicDir = path.join(__dirname, 'public');

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  
  // Serve static files from .next/static
  if (url.startsWith('/_next/static/')) {
    const filePath = path.join(__dirname, url);
    serveFile(filePath, res);
    return;
  }
  
  // Serve public files
  if (url.startsWith('/favicon') || url.startsWith('/logo') || url === '/manifest.json') {
    const filePath = path.join(publicDir, url);
    serveFile(filePath, res);
    return;
  }
  
  // All other routes serve the index.html (SPA)
  const indexPath = path.join(__dirname, '.next', 'server', 'app', 'index.html');
  serveFile(indexPath, res, 'text/html');
});

function serveFile(filePath, res, forceType) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath);
  const contentType = forceType || mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Static server running on http://0.0.0.0:${PORT}`);
});
