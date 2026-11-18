import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';
import server from './dist/server/server.js';

const port = process.env.PORT || 3000;

/**
 * Vite copies everything in public/ into dist/client/ at build time, but the
 * SSR handler below only renders routes — it never serves those files. Without
 * this middleware every request for /robots.txt, /llms.txt or /favicon.svg
 * falls through to the catch-all route and gets the 404 page back with a 200
 * status, which crawlers read as "this file exists and contains HTML".
 */
async function detectClientDir() {
  // Resolved at boot rather than hardcoded: the client bundle has moved
  // between dist/client and .output/public across TanStack Start versions,
  // and guessing wrong here brings the soft-404 behaviour straight back.
  for (const candidate of ['./dist/client', './.output/public', './dist/public']) {
    const dir = fileURLToPath(new URL(candidate, import.meta.url));
    try {
      if ((await stat(dir)).isDirectory()) return dir;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

const CLIENT_DIR = await detectClientDir();

console.log(
  CLIENT_DIR
    ? `Serving static files from ${CLIENT_DIR}`
    : 'WARNING: no client build directory found — static files will 404',
);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

/**
 * Text assets are worth compressing; images, fonts and video already are.
 * The app bundle alone is ~450KB raw and ~120KB gzipped, and Lighthouse put
 * uses-text-compression at 381KiB across the page.
 */
const COMPRESSIBLE = new Set([
  '.css',
  '.js',
  '.json',
  '.map',
  '.mjs',
  '.svg',
  '.txt',
  '.webmanifest',
  '.xml',
]);

function acceptsGzip(req) {
  // Matches "gzip" but not "x-gzip;q=0" style refusals.
  const header = req.headers['accept-encoding'] || '';
  return /(^|,)\s*gzip\s*(;|,|$)/.test(header);
}

/**
 * Resolves a URL path to a file inside dist/client, or null when there is no
 * such file. Returns null for anything that escapes the directory, so a
 * request like /../../.env cannot read outside the build output.
 */
async function resolveStaticFile(pathname) {
  if (!CLIENT_DIR) return null;
  if (pathname === '/' || pathname.endsWith('/')) return null;

  const decoded = decodeURIComponent(pathname);
  if (decoded.includes('\0')) return null;

  const filePath = join(CLIENT_DIR, normalize(decoded));
  if (filePath !== CLIENT_DIR && !filePath.startsWith(`${CLIENT_DIR}/`)) {
    return null;
  }

  try {
    const stats = await stat(filePath);
    return stats.isFile() ? filePath : null;
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' || req.method === 'HEAD') {
    const filePath = await resolveStaticFile(url.pathname);

    if (filePath) {
      // Hashed build assets are immutable; files copied from public/ keep a
      // short TTL so robots.txt and llms.txt can be updated by a redeploy.
      const isHashedAsset =
        url.pathname.startsWith('/assets/') || url.pathname.startsWith('/_build/');

      const extension = extname(filePath);
      const gzip = COMPRESSIBLE.has(extension) && acceptsGzip(req);

      // No Content-Length is sent either way, so gzipping needs no extra care
      // about a stale length. Vary is set unconditionally: the same URL can
      // answer compressed or not depending on the request.
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
        'Cache-Control': isHashedAsset
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=3600',
        Vary: 'Accept-Encoding',
        ...(gzip ? { 'Content-Encoding': 'gzip' } : {}),
      });

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      const file = createReadStream(filePath);
      if (gzip) {
        file.pipe(createGzip()).pipe(res);
      } else {
        file.pipe(res);
      }
      return;
    }
  }

  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: ['GET', 'HEAD'].includes(req.method) ? null : req,
  });

  const response = await server.fetch(request);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}).listen(port, () => {
  console.log(`Server running on port ${port}`);
});
