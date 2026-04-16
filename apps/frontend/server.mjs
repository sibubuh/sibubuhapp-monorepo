import { createServer } from 'node:http';
import server from './dist/server/server.js';

const port = process.env.PORT || 3000;

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
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
