#!/usr/bin/env bash
set -euo pipefail

# Interactive environment setup for the media-server-stack
# Generates a .env file by prompting for all required variables.

USE_WHITELIST=0
if command -v whiptail >/dev/null 2>&1; then
  USE_WHITELIST=1
fi

ask_var() {
  local var="$1" prompt="$2" default="$3"
  local answer
  if [ "$USE_WHITELIST" -eq 1 ]; then
    answer=$(whiptail --title "${var}" --inputbox "${prompt}" 10 78 "${default}" 3>&1 1>&2 2>&3)
  else
    read -rp "${prompt} [${default}]: " answer
    answer="${answer:-$default}"
  fi
  echo "$answer"
}

CONFIG_FILE=".env"
echo "Creating ${CONFIG_FILE}..."
: > "$CONFIG_FILE"

write_var() {
  local var="$1" val="$2"
  echo "${var}=${val}" >> "$CONFIG_FILE"
}

# Prompt for each variable with sensible defaults
write_var "VPN_PROVIDER"      "$(ask_var VPN_PROVIDER "VPN service provider (e.g. mullvad)" "mullvad")"
write_var "VPN_TYPE"          "$(ask_var VPN_TYPE "VPN type (e.g. wireguard)" "wireguard")"
write_var "VPN_PORT_FORWARDING" "$(ask_var VPN_PORT_FORWARDING "VPN port forwarding" "on")"
write_var "DOMAIN"            "$(ask_var DOMAIN "Main domain for reverse proxy" "yourdomain.com")"
write_var "EMAIL"             "$(ask_var EMAIL "Email for Let's Encrypt notifications" "admin@yourdomain.com")"
write_var "PUID"              "$(ask_var PUID "Local user ID to run containers as" "1000")"
write_var "PGID"              "$(ask_var PGID "Local group ID to run containers as" "1000")"
write_var "TZ"                "$(ask_var TZ "Timezone identifier (e.g. UTC, Europe/London)" "UTC")"
write_var "UMASK"             "$(ask_var UMASK "Umask for file creation inside containers" "002")"
write_var "DATA_ROOT"         "$(ask_var DATA_ROOT "Host data root path" "$(pwd)/data")"
write_var "CONFIG_ROOT"       "$(ask_var CONFIG_ROOT "Host config root path" "$(pwd)/config")"
write_var "POSTGRES_USER"     "$(ask_var POSTGRES_USER "Postgres username" "mediaserver")"
write_var "POSTGRES_DB"       "$(ask_var POSTGRES_DB "Postgres database name" "mediaserver")"
write_var "POSTGRES_PASSWORD_FILE" "$(ask_var POSTGRES_PASSWORD_FILE "Docker secret file for Postgres password" "/run/secrets/postgres_password")"

# API key files
for svc in jellyfin sonarr radarr lidarr readarr bazarr tautulli; do
  var="${svc^^}_API_KEY_FILE"
  default="/run/secrets/${svc}_api_key"
  write_var "$var" "$(ask_var "$var" "Docker secret file for ${svc^} API key" "$default")"
done

# PhotoPrism and Online Videos
write_var "PHOTOPRISM_ADMIN_PASSWORD_FILE" \
  "$(ask_var PHOTOPRISM_ADMIN_PASSWORD_FILE "Docker secret file for PhotoPrism admin password" "/run/secrets/photoprism_admin_password")"
write_var "YTDL_MATERIAL_IMAGE" \
  "$(ask_var YTDL_MATERIAL_IMAGE "Image name for YouTubeDL-Material (GHCR or DockerHub)" "ghcr.io/iv-org/youtube-dl-material:latest")"
write_var "YTDL_MATERIAL_PORT" \
  "$(ask_var YTDL_MATERIAL_PORT "Port to expose YouTubeDL-Material" "17442")"

echo "Configuration written to ${CONFIG_FILE}. Review and customize further before deploying."