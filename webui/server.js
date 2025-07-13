import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const STACK_DIR = process.env.STACK_DIR || path.join(__dirname, '..');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

function run(cmd, res) {
  exec(cmd, { cwd: STACK_DIR }, (err, stdout, stderr) => {
    if (err) {
      res.status(500).send(stderr);
    } else {
      res.type('text/plain').send(stdout);
    }
  });
}

app.get('/api/status', (req, res) => run('docker compose ps', res));
app.post('/api/start', (req, res) => run('docker compose up -d', res));
app.post('/api/stop', (req, res) => run('docker compose down', res));

app.listen(PORT, () => {
  console.log(`Web UI listening on port ${PORT}`);
});
