import { defineConfig } from 'vite';
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';

export default defineConfig({
  // GitHub Pages deploys to https://<user>.github.io/<repo>/
  // Change 'FoodMap' to your actual repo name
  base: '/FoodMap/',
  plugins: [
    {
      name: 'local-admin-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/save' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const dataPath = path.resolve(__dirname, 'src/data/restaurants.json');
                fs.writeFileSync(dataPath, JSON.stringify(JSON.parse(body), null, 2));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          }

          if (req.url === '/api/save-categories' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const dataPath = path.resolve(__dirname, 'src/data/categories.json');
                fs.writeFileSync(dataPath, JSON.stringify(JSON.parse(body), null, 2));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
            return;
          }

          if (req.url === '/api/push' && req.method === 'POST') {
            exec('git add .', () => {
              exec('git commit -m "Update data from local UI"', () => {
                exec('git push', (error, stdout, stderr) => {
                  res.setHeader('Content-Type', 'application/json');
                  if (error) {
                    res.end(JSON.stringify({ success: false, error: stderr || error.message }));
                  } else {
                    res.end(JSON.stringify({ success: true, stdout }));
                  }
                });
              });
            });
            return;
          }

          next();
        });
      }
    }
  ]
});
