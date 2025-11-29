import express from 'express';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const STACK_DIR = process.env.STACK_DIR || path.join(__dirname, '..');
const COMPOSE_CMD = process.env.COMPOSE_CMD || 'docker compose';
const execAsync = promisify(exec);

const ALLOWED_ACTIONS = {
  status: `${COMPOSE_CMD} ps --format json`,
  start: `${COMPOSE_CMD} up -d`,
  stop: `${COMPOSE_CMD} down`,
  restart: `${COMPOSE_CMD} down && ${COMPOSE_CMD} up -d`,
};

const BEST_PRACTICES = [
  {
    title: 'Encrypted ingress everywhere',
    detail: 'Ensure Traefik issues TLS certs for every service and enforce HTTPS → HTTP redirects.',
  },
  {
    title: 'Per-service health probes',
    detail:
      'Use 30s interval HTTP checks for Jellyfin, Sonarr, Radarr, Prowlarr, and qBittorrent to keep Watchtower honest.',
  },
  {
    title: 'Immutable builds + pinned tags',
    detail: 'Pin critical images (Jellyfin, qBittorrent, *arr apps) to digest tags before enabling auto-updates.',
  },
  {
    title: 'Network segmentation',
    detail: 'Run public ingress on a distinct Traefik network and isolate download clients on a private bridge.',
  },
  {
    title: 'Secrets over env',
    detail: 'Prefer Docker secrets for API tokens and passwords; reserve env vars for non-sensitive toggles.',
  },
];

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

async function runCommand(command) {
  const { stdout, stderr } = await execAsync(command, {
    cwd: STACK_DIR,
    timeout: 60_000,
    maxBuffer: 10 * 1024 * 1024,
  });

  if (stderr) {
    return { output: stdout || stderr, stderr };
  }

  return { output: stdout };
}

function parseComposeJson(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed.services) return parsed.services;
    return null;
  } catch (err) {
    return null;
  }
}

app.get('/api/compose/status', async (req, res) => {
  const command = ALLOWED_ACTIONS.status;
  try {
    const { output } = await runCommand(command);
    const parsed = parseComposeJson(output);
    res.json({ raw: output, summary: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message, raw: err.stderr || err.stdout || '' });
  }
});

app.post('/api/compose/:action', async (req, res) => {
  const action = req.params.action;
  const command = ALLOWED_ACTIONS[action];

  if (!command) {
    return res.status(400).json({ error: 'Unsupported action' });
  }

  try {
    const { output } = await runCommand(command);
    res.json({ message: `${action} executed`, raw: output });
  } catch (err) {
    res.status(500).json({ error: err.message, raw: err.stderr || err.stdout || '' });
  }
});

app.post('/api/agent/batch', async (req, res) => {
  const actions = Array.isArray(req.body?.actions) ? req.body.actions : [];
  const logs = [];

  for (const action of actions) {
    const command = ALLOWED_ACTIONS[action];
    if (!command) {
      logs.push({ action, status: 'skipped', output: 'Unsupported action' });
      continue;
    }

    try {
      const { output } = await runCommand(command);
      logs.push({ action, status: 'ok', output });
    } catch (err) {
      logs.push({ action, status: 'error', output: err.stderr || err.stdout || err.message });
      break;
    }
  }

  res.json({ completed: logs });
});

app.get('/api/best-practices', (req, res) => {
  res.json({ generatedAt: new Date().toISOString(), items: BEST_PRACTICES });
});

app.listen(PORT, () => {
  console.log(`Web UI listening on port ${PORT}`);
});
