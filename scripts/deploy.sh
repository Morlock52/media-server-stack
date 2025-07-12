 #!/usr/bin/env bash
 set -euo pipefail

# Determine project root
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load environment variables from .env, or copy .env.example if missing
if [[ -f "$ROOT/.env" ]]; then
  set -o allexport
  # shellcheck disable=SC1090
  source "$ROOT/.env"
  set +o allexport
else
  echo "WARNING: .env not found, copying .env.example to .env"
  cp "$ROOT/.env.example" "$ROOT/.env"
  set -o allexport
  source "$ROOT/.env"
  set +o allexport
fi

# Auto-create symlinks for Docker Compose CLI convenience
ln -sf "$ROOT/compose/docker-compose.yml" "$ROOT/docker-compose.yml"
ln -sf "$ROOT/compose/compose.production.yml" "$ROOT/docker-compose.override.yml"

# Data and config roots (override via .env)
DATA_ROOT="${DATA_ROOT:-$ROOT/data}"
CONFIG_ROOT="${CONFIG_ROOT:-$ROOT/config}"

# Configuration
COMPOSE_FILES="-f compose/docker-compose.yml"
HEALTH_CHECK_TIMEOUT=300
BACKUP_RETENTION=30

 log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >&2
}

check_prerequisites() {
    log "Checking prerequisites..."
    command -v docker >/dev/null 2>&1 || { log "Docker not installed"; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { log "Docker Compose not installed"; exit 1; }
}

create_directories() {
    log "Creating project data and config directories under $DATA_ROOT and $CONFIG_ROOT"
    mkdir -p "$DATA_ROOT"/{media,torrents,usenet}/{movies,tv,music,online-videos}
    mkdir -p "$CONFIG_ROOT"/{jellyfin,sonarr,radarr,lidarr,readarr,prowlarr,qbittorrent,overseerr,bazarr,mylar,podgrab,photoprism,tautulli,youtube-dl-material}
    # Ensure proper permissions; ignore failures on platforms where chown may be restricted (e.g., macOS)
    chown -R 1000:1000 "$DATA_ROOT" "$CONFIG_ROOT" 2>/dev/null || log "Warning: unable to chown data/config directories"
    chmod -R 755 "$DATA_ROOT" "$CONFIG_ROOT" 2>/dev/null || true
}

deploy_stack() {
    log "Deploying media server stack..."
    pushd "$ROOT" >/dev/null
    docker-compose $COMPOSE_FILES up -d
    popd >/dev/null

  log "Waiting for services to be healthy..."
  timeout $HEALTH_CHECK_TIMEOUT bash -c '
    while ! docker-compose $COMPOSE_FILES ps | grep -q "healthy"; do
      sleep 10
    done
  '
}

verify_deployment() {
  log "Verifying deployment..."
  local failed_services=()

    pushd "$ROOT" >/dev/null
    for service in jellyfin sonarr radarr prowlarr qbittorrent overseerr; do
        if ! docker-compose $COMPOSE_FILES ps $service | grep -q "Up"; then
            failed_services+=($service)
        fi
    done
    popd >/dev/null

  if [ ${#failed_services[@]} -gt 0 ]; then
    log "Failed services: ${failed_services[*]}"
    exit 1
  fi

  log "All services deployed successfully!"
}

# Main execution
main() {
  log "Starting media server deployment..."
  check_prerequisites
  create_directories
  deploy_stack
  verify_deployment
  log "Deployment completed successfully!"
}

main "$@"