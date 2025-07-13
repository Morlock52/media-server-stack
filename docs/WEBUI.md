# Web UI Guide

This guide explains how to use the React-based Web UI included with the media server stack.

## Features
- Start, stop and view the status of the Docker Compose stack.
- Runs as a lightweight Node/Express service.

## Quick Start (Non-technical)
1. Install Docker Desktop and ensure it is running.
2. From the project root run:
   ```bash
   ./scripts/deploy.sh
   ```
3. Open your browser at `http://localhost:3000`.
4. Use the buttons to start, stop or check the stack status.

## Technical Details
- The Web UI uses [`docker compose`](https://docs.docker.com/compose/) commands under the hood.
- The container mounts `/var/run/docker.sock` to control Docker on the host.
- You can customize the UI by editing files in `webui/src` and rebuilding with `npm run build`.

## Building Manually
```bash
cd webui
npm install
npm run build
docker build -t media-webui .
```

Run the container with:
```bash
docker run -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock media-webui
```
