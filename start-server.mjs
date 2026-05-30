import { createServer } from 'http';
import { createRequire } from 'module';

// Start Next.js server using the standalone build
const require = createRequire(import.meta.url);

async function start() {
  try {
    const { default: next } = await import('next');
    const app = next({ dev: false, hostname: '0.0.0.0', port: 3000 });
    const handle = app.getRequestHandler();
    
    await app.prepare();
    
    createServer(async (req, res) => {
      try {
        await handle(req, res);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    }).listen(3000, '0.0.0.0', () => {
      console.log('> Server listening on http://0.0.0.0:3000');
    });
  } catch (e) {
    console.error('Failed to start:', e);
    process.exit(1);
  }
}

start();
