 # Media Server Stack

This project provides a production-ready, Docker Compose-based media server stack, including Jellyfin, Sonarr, Radarr, Lidarr, Readarr, Prowlarr, qBittorrent, Overseerr, Bazarr, Tautulli, and more, all routed through a VPN and secured via Traefik reverse proxy with Let's Encrypt SSL.

 ## Prerequisites

 - Docker Engine ≥ 24.0
 - Docker Compose v2
 - Bash

 ## Quick Start

1. Copy `.env.example` to `.env` and update the variables (especially `DATA_ROOT`/`CONFIG_ROOT` if you want your data/config stored elsewhere):
   ```bash
   cp .env.example .env
   ```
2. Deploy the stack (this will create necessary symlinks, directories, and launch the services):
   ```bash
   cd media-server-stack
   ./scripts/deploy.sh
   ```

# Optionally, you can now run:
#   docker compose up -d
# directly (deploy.sh already symlinks compose/docker-compose.yml and compose/compose.production.yml).

3. Access the YouTubeDL-Material web UI at <http://localhost:${YTDL_MATERIAL_PORT:-17442}> to configure online video downloads.
4. After deployment, open the new Web UI at <http://localhost:3000> to monitor and manage the stack with start/stop controls and service status output.

 ## Directory Structure

 ```text
 media-server-stack/
 ├── .your-agent/
 ├── compose/
 ├── config/
 ├── scripts/
 ├── .env.example
 ├── .env
 ├── PLAN.md
 ├── SECURITY.md
 └── README.md
 ```

For full documentation, see `PLAN.md` and `SECURITY.md`.
The Web UI is documented separately in `docs/WEBUI.md`.

## Interactive Environment Setup

Use the included setup script to generate your `.env` interactively (with sane defaults and a GUI if available):

```bash
./scripts/setup.sh
```

> **NOTE:** Before deploying, complete the core service definitions in `compose/docker-compose.yml` (e.g. Jellyfin, Sonarr, Radarr, qBittorrent, etc.). The provided stub contains only example services. Incomplete or placeholder YAML will cause parser errors.

### Authenticating to GitHub Container Registry (GHCR)

If you’ll use the default GHCR image for YouTubeDL-Material you must log in:
```bash
echo $GHCR_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

To avoid GHCR logins, you can override the image to a Docker Hub mirror:
```bash
YTDL_MATERIAL_IMAGE=hotio/youtube-dl-material:latest ./scripts/deploy.sh
```